import * as React from "react"
import { LineChart } from "grapher/lineCharts/LineChart"
import { SynthesizeOwidTable } from "owidTable/OwidTable"

export default {
    title: "LineChart",
    component: LineChart,
}

export const Default = () => {
    const table = SynthesizeOwidTable({
        timeRange: [2000, 2010],
        countryCount: 5,
    })
    const options = { table, yColumns: [table.get("GDP")!] }
    table.selectAll()

    return (
        <svg width={640} height={480}>
            <LineChart options={options} />
        </svg>
    )
}
