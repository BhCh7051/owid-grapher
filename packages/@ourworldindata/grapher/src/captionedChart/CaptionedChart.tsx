import React from "react"
import { action, computed } from "mobx"
import { observer } from "mobx-react"
import {
    Bounds,
    DEFAULT_BOUNDS,
    exposeInstanceOnWindow,
    MarkdownTextWrap,
    sumTextWrapHeights,
} from "@ourworldindata/utils"
import { Header } from "../header/Header"
import { Footer, StaticFooter } from "../footer/Footer"
import {
    ChartComponentClassMap,
    DefaultChartClass,
} from "../chart/ChartTypeMap"
import {
    BASE_FONT_SIZE,
    ChartTypeName,
    FacetStrategy,
    GrapherTabOption,
    Patterns,
    RelatedQuestionsConfig,
    STATIC_EXPORT_DETAIL_SPACING,
    SizeVariant,
} from "../core/GrapherConstants"
import { MapChartManager } from "../mapCharts/MapChartConstants"
import { ChartManager } from "../chart/ChartManager"
import { LoadingIndicator } from "../loadingIndicator/LoadingIndicator"
import { FacetChart } from "../facetChart/FacetChart"
import {
    faRightLeft,
    faPencilAlt,
    faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome/index.js"
import {
    ZoomToggle,
    AbsRelToggle,
    AbsRelToggleManager,
    FacetYDomainToggle,
    FacetYDomainToggleManager,
    FacetStrategyDropdown,
    FacetStrategyDropdownManager,
    NoDataAreaToggle,
} from "../controls/Controls"
import { ScaleSelector } from "../controls/ScaleSelector"
import { AddEntityButton } from "../controls/AddEntityButton"
import { FooterManager } from "../footer/FooterManager"
import { HeaderManager } from "../header/HeaderManager"
import { SelectionArray } from "../selection/SelectionArray"
import { EntityName } from "@ourworldindata/core-table"
import { AxisConfig } from "../axis/AxisConfig"
import { DataTable, DataTableManager } from "../dataTable/DataTable"
import {
    ContentSwitchers,
    ContentSwitchersManager,
} from "../controls/ContentSwitchers"
import { TimelineComponent } from "../timeline/TimelineComponent"
import { TimelineController } from "../timeline/TimelineController"

export interface CaptionedChartManager
    extends ChartManager,
        MapChartManager,
        AbsRelToggleManager,
        FooterManager,
        HeaderManager,
        FacetYDomainToggleManager,
        FacetStrategyDropdownManager,
        DataTableManager,
        ContentSwitchersManager {
    containerElement?: HTMLDivElement
    tabBounds?: Bounds
    sizeVariant?: SizeVariant
    fontSize?: number
    tab?: GrapherTabOption
    type?: ChartTypeName
    yAxis?: AxisConfig
    xAxis?: AxisConfig
    typeExceptWhenLineChartAndSingleTimeThenWillBeBarChart?: ChartTypeName
    isReady?: boolean
    whatAreWeWaitingFor?: string
    entityType?: string
    entityTypePlural?: string
    showYScaleToggle?: boolean
    showXScaleToggle?: boolean
    showZoomToggle?: boolean
    showAbsRelToggle?: boolean
    showNoDataAreaToggle?: boolean
    showFacetYDomainToggle?: boolean
    showChangeEntityButton?: boolean
    showAddEntityButton?: boolean
    showSelectEntitiesButton?: boolean
    shouldIncludeDetailsInStaticExport?: boolean
    detailRenderers: MarkdownTextWrap[]
    isOnMapTab?: boolean
    isOnChartTab?: boolean
    isOnTableTab?: boolean
    hasTimeline?: boolean
    timelineController?: TimelineController
    hasRelatedQuestion?: boolean
    isRelatedQuestionTargetDifferentFromCurrentPage?: boolean
    relatedQuestions?: RelatedQuestionsConfig[]
}

interface CaptionedChartProps {
    manager: CaptionedChartManager
    bounds?: Bounds
    maxWidth?: number
}

// keep in sync with sass variables in CaptionedChart.scss
const FRAME_PADDING = 16
const CONTROLS_ROW_HEIGHT = 32
const TIMELINE_HEIGHT = CONTROLS_ROW_HEIGHT

// todo(redesign): we might want to rename CaptionedChart later

@observer
export class CaptionedChart extends React.Component<CaptionedChartProps> {
    @computed protected get manager(): CaptionedChartManager {
        return this.props.manager
    }

    @computed private get containerElement(): HTMLDivElement | undefined {
        return this.manager?.containerElement
    }

    @computed protected get maxWidth(): number {
        return this.props.maxWidth ?? this.bounds.width - 2 * FRAME_PADDING
    }

    @computed protected get sizeVariant(): SizeVariant {
        return this.manager.sizeVariant ?? SizeVariant.lg
    }

    @computed protected get verticalPadding(): number {
        const { sizeVariant } = this
        const { xs, sm, md, lg } = SizeVariant
        return {
            [xs]: 4,
            [sm]: 8,
            [md]: 12,
            [lg]: 16,
        }[sizeVariant]
    }

    @computed protected get verticalPaddingSmall(): number {
        return this.sizeVariant === SizeVariant.xs ? 4 : 8
    }

    @computed protected get relatedQuestionHeight(): number {
        return this.sizeVariant === SizeVariant.lg ? 28 : 24
    }

    @computed protected get header(): Header {
        return new Header({
            manager: this.manager,
            maxWidth: this.maxWidth,
        })
    }

    @computed protected get footer(): Footer {
        return new Footer({
            manager: this.manager,
            maxWidth: this.maxWidth,
            verticalPaddingSmall: this.verticalPaddingSmall,
        })
    }

    protected get patterns(): JSX.Element {
        return (
            <defs>
                <pattern
                    id={Patterns.noDataPattern}
                    key={Patterns.noDataPattern}
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4"
                    patternTransform="rotate(-45 2 2)"
                >
                    <path d="M -1,2 l 6,0" stroke="#ccc" strokeWidth="0.7" />
                </pattern>
            </defs>
        )
    }

    @computed protected get bounds(): Bounds {
        return this.props.bounds ?? this.manager.tabBounds ?? DEFAULT_BOUNDS
    }

    @computed protected get boundsForChartArea(): Bounds {
        const { bounds, chartHeight, manager } = this
        const padBottom = manager.isOnChartTab ? 4 : 0
        return new Bounds(0, 0, bounds.width, chartHeight)
            .padWidth(FRAME_PADDING)
            .padBottom(padBottom)
    }

    @computed get isFaceted(): boolean {
        const hasStrategy =
            !!this.manager.facetStrategy &&
            this.manager.facetStrategy !== FacetStrategy.none
        return !this.manager.isOnMapTab && hasStrategy
    }

    @computed get showControlsRow(): boolean {
        return (this.manager.availableTabs?.length ?? 0) > 1
    }

    renderChart(): JSX.Element {
        const { manager } = this
        const bounds = this.boundsForChartArea

        const chartTypeName = this.manager.isOnMapTab
            ? ChartTypeName.WorldMap
            : manager.typeExceptWhenLineChartAndSingleTimeThenWillBeBarChart ??
              manager.type ??
              ChartTypeName.LineChart
        const ChartClass =
            ChartComponentClassMap.get(chartTypeName) ?? DefaultChartClass

        // Todo: make FacetChart a chart type name?
        if (this.isFaceted)
            return (
                <FacetChart
                    bounds={bounds}
                    chartTypeName={chartTypeName}
                    manager={manager}
                />
            )

        return (
            <ChartClass
                bounds={bounds}
                manager={manager}
                containerElement={this.containerElement}
            />
        )
    }

    componentDidMount(): void {
        exposeInstanceOnWindow(this, "captionedChart")
    }

    @action.bound startSelecting(): void {
        this.manager.isSelectingData = true
    }

    @computed get controls(): JSX.Element[] {
        const manager = this.manager
        if (
            !manager.isReady ||
            this.manager.isOnMapTab ||
            this.manager.isOnTableTab
        )
            return []

        const { showYScaleToggle, showXScaleToggle } = manager

        const controls: JSX.Element[] = []

        if (showYScaleToggle)
            controls.push(
                <ScaleSelector
                    key="scaleSelector"
                    manager={manager.yAxis!}
                    prefix={showXScaleToggle ? "Y: " : ""}
                />
            )

        if (showXScaleToggle)
            controls.push(
                <ScaleSelector
                    key="scaleSelector"
                    manager={manager.xAxis!}
                    prefix={"X: "}
                />
            )

        if (manager.showSelectEntitiesButton)
            controls.push(
                <button
                    type="button"
                    key="grapher-select-entities"
                    data-track-note="grapher_select_entities"
                    style={controls.length === 0 ? { padding: 0 } : {}} // If there are no controls to the left then set padding to 0 for better alignment
                    onClick={this.startSelecting}
                >
                    <span className="SelectEntitiesButton">
                        <FontAwesomeIcon icon={faPencilAlt} />
                        {`Select ${manager.entityTypePlural}`}
                    </span>
                </button>
            )

        if (manager.showChangeEntityButton)
            controls.push(
                <button
                    type="button"
                    key="grapher-change-entities"
                    data-track-note="grapher_change_entity"
                    className="ChangeEntityButton"
                    onClick={this.startSelecting}
                >
                    <FontAwesomeIcon icon={faRightLeft} /> Change{" "}
                    {manager.entityType}
                </button>
            )

        if (manager.showAddEntityButton)
            controls.push(
                <AddEntityButton key="AddEntityButton" manager={manager} />
            )

        if (manager.showZoomToggle)
            controls.push(<ZoomToggle key="ZoomToggle" manager={manager} />)

        if (
            manager.showFacetControl &&
            manager.availableFacetStrategies.length > 1
        ) {
            controls.push(
                <FacetStrategyDropdown
                    key="FacetStrategyDropdown"
                    manager={manager}
                />
            )
        }

        if (manager.showAbsRelToggle)
            controls.push(<AbsRelToggle key="AbsRelToggle" manager={manager} />)

        if (manager.showNoDataAreaToggle)
            controls.push(
                <NoDataAreaToggle key="NoDataAreaToggle" manager={manager} />
            )

        if (manager.showFacetYDomainToggle)
            controls.push(
                <FacetYDomainToggle
                    key="FacetYDomainToggle"
                    manager={manager}
                />
            )

        return controls
    }

    @computed get selectionArray(): SelectionArray | EntityName[] | undefined {
        return this.manager.selection
    }

    @computed get showRelatedQuestion(): boolean {
        return (
            !!this.manager.relatedQuestions &&
            !!this.manager.hasRelatedQuestion &&
            !!this.manager.isRelatedQuestionTargetDifferentFromCurrentPage
        )
    }

    private renderControlsRow(): JSX.Element {
        return (
            <nav className="controlsRow">
                <ContentSwitchers manager={this.manager} />
                <div className="controls">
                    {this.controls.length > 0 && (
                        <button className="configure">Configure</button>
                    )}
                </div>
            </nav>
        )
    }

    private renderRelatedQuestion(): JSX.Element {
        const { relatedQuestions } = this.manager
        return (
            <div
                className="relatedQuestion"
                style={{ height: this.relatedQuestionHeight }}
            >
                Related:&nbsp;
                <a
                    href={relatedQuestions![0].url}
                    target="_blank"
                    rel="noopener"
                    data-track-note="chart_click_related"
                >
                    {relatedQuestions![0].text}
                </a>
                <FontAwesomeIcon icon={faExternalLinkAlt} />
            </div>
        )
    }

    private renderLoadingIndicator(): JSX.Element {
        return (
            <foreignObject {...this.boundsForChartArea.toProps()}>
                <LoadingIndicator title={this.manager.whatAreWeWaitingFor} />
            </foreignObject>
        )
    }

    private renderDataTable(): JSX.Element {
        const { boundsForChartArea } = this
        const containerStyle: React.CSSProperties = {
            position: "relative",
            ...this.boundsForChartArea.toCSS(),
        }
        return (
            <div style={containerStyle}>
                <DataTable bounds={boundsForChartArea} manager={this.manager} />
            </div>
        )
    }

    private renderChartOrMap(): JSX.Element {
        const { bounds, chartHeight } = this
        const { width } = bounds

        const containerStyle: React.CSSProperties = {
            position: "relative",
            clear: "both",
            height: chartHeight,
        }

        return (
            <div style={containerStyle}>
                <svg
                    {...this.svgProps}
                    width={width}
                    height={chartHeight}
                    viewBox={`0 0 ${width} ${chartHeight}`}
                >
                    {this.patterns}
                    {this.manager.isReady
                        ? this.renderChart()
                        : this.renderLoadingIndicator()}
                </svg>
            </div>
        )
    }

    private renderTimeline(): JSX.Element {
        return (
            <TimelineComponent
                timelineController={this.manager.timelineController!}
                maxWidth={this.maxWidth}
            />
        )
    }

    // The height of the chart area is the total height of the frame minus the height of the header, footer, controls, etc.
    @computed protected get chartHeight(): number {
        return Math.floor(
            this.bounds.height -
                2 * FRAME_PADDING -
                // height of the header and the padding below
                this.header.height -
                this.verticalPadding -
                // if present, height of the controls row and the padding below
                // (might not be present if there's only one tab and no controls)
                (this.showControlsRow
                    ? CONTROLS_ROW_HEIGHT + this.verticalPaddingSmall
                    : 0) -
                // if present, height of the timeline and the padding above
                (this.manager.hasTimeline
                    ? this.verticalPaddingSmall + TIMELINE_HEIGHT
                    : 0) -
                // height of the footer and the padding above
                this.verticalPadding -
                this.footer.height -
                // height of the related question, if present
                (this.showRelatedQuestion
                    ? this.relatedQuestionHeight - FRAME_PADDING * 0.25
                    : 0)
        )
    }

    // if you edit the render function, make sure to keep chartHeight in sync
    render(): JSX.Element {
        return (
            <>
                {/* header and padding below */}
                <Header manager={this.manager} maxWidth={this.maxWidth} />
                <VerticalSpace height={this.verticalPadding} />

                {/* controls row and padding below */}
                {this.showControlsRow && this.renderControlsRow()}
                {this.showControlsRow && (
                    <VerticalSpace height={this.verticalPaddingSmall} />
                )}

                {/* chart, map or table */}
                {this.manager.isOnTableTab
                    ? this.renderDataTable()
                    : this.renderChartOrMap()}

                {/* timeline and padding above */}
                {this.manager.hasTimeline && (
                    <VerticalSpace height={this.verticalPaddingSmall} />
                )}
                {this.manager.hasTimeline && this.renderTimeline()}

                {/* footer and padding above */}
                <VerticalSpace height={this.verticalPadding} />
                <Footer
                    manager={this.manager}
                    maxWidth={this.maxWidth}
                    verticalPaddingSmall={this.verticalPaddingSmall}
                />

                {/* related question */}
                {this.showRelatedQuestion && this.renderRelatedQuestion()}
            </>
        )
    }

    @computed protected get svgProps(): React.SVGProps<SVGSVGElement> {
        return {
            xmlns: "http://www.w3.org/2000/svg",
            version: "1.1",
            style: {
                fontFamily:
                    "Lato, 'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif",
                fontSize: this.manager.fontSize ?? BASE_FONT_SIZE,
                backgroundColor: "white",
                textRendering: "geometricPrecision",
                WebkitFontSmoothing: "antialiased",
                overflow: "visible",
            },
        }
    }
}

@observer
export class StaticCaptionedChart extends CaptionedChart {
    constructor(props: CaptionedChartProps) {
        super(props)
    }

    @computed protected get staticFooter(): Footer {
        const { paddedBounds } = this
        return new StaticFooter({
            manager: this.manager,
            maxWidth: this.maxWidth,
            targetX: paddedBounds.x,
            targetY: paddedBounds.bottom - this.footer.height,
        })
    }

    @computed private get paddedBounds(): Bounds {
        return this.bounds.pad(FRAME_PADDING)
    }

    @computed protected get boundsForChartArea(): Bounds {
        return this.paddedBounds
            .padTop(Math.max(this.header.height, this.header.logoHeight))
            .padBottom(this.staticFooter.height + this.verticalPadding)
            .padTop(this.manager.isOnMapTab ? 0 : this.verticalPadding)
    }

    // todo(redesign)
    renderSVGDetails(): JSX.Element | null {
        if (!this.manager.shouldIncludeDetailsInStaticExport) {
            return null
        }

        let yOffset = 0
        let previousOffset = 0
        return (
            <>
                <line
                    x1={FRAME_PADDING}
                    y1={this.bounds.height}
                    x2={this.boundsForChartArea.width + FRAME_PADDING}
                    y2={this.bounds.height}
                    stroke="#777"
                ></line>
                <g
                    style={{
                        transform: `translate(15px, ${
                            // + padding below the grey line
                            this.bounds.height + FRAME_PADDING
                        }px)`,
                    }}
                >
                    {this.manager.detailRenderers.map((detail, i) => {
                        previousOffset = yOffset
                        yOffset += detail.height + STATIC_EXPORT_DETAIL_SPACING
                        return detail.renderSVG(0, previousOffset, { key: i })
                    })}
                </g>
            </>
        )
    }

    render(): JSX.Element {
        const { bounds, paddedBounds, manager, maxWidth } = this
        let { width, height } = bounds

        if (this.manager.shouldIncludeDetailsInStaticExport) {
            height += sumTextWrapHeights(
                this.manager.detailRenderers,
                STATIC_EXPORT_DETAIL_SPACING
            )
        }

        return (
            <svg
                {...this.svgProps}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                {this.patterns}
                <rect
                    className="background-fill"
                    fill="white"
                    width={width}
                    height={height}
                />
                {this.header.renderStatic(paddedBounds.x, paddedBounds.y)}
                {this.renderChart()}
                <StaticFooter
                    manager={manager}
                    maxWidth={maxWidth}
                    targetX={paddedBounds.x}
                    targetY={paddedBounds.bottom - this.staticFooter.height}
                />
                {this.renderSVGDetails()}
            </svg>
        )
    }
}

function VerticalSpace({ height }: { height: number }): JSX.Element {
    return (
        <div
            style={{
                height,
                width: "100%",
            }}
        />
    )
}
