import React from "react"
import { Head } from "./Head.js"
import { SiteHeader } from "./SiteHeader.js"
import { SiteFooter } from "./SiteFooter.js"

export const DonatePage = (props: {
    baseUrl: string
    recaptchaKey: string
}) => (
    <html>
        <Head
            canonicalUrl={`${props.baseUrl}/donate`}
            pageTitle="Donate"
            baseUrl={props.baseUrl}
        >
            <script src="https://js.stripe.com/v3/" />
            <script
                src={`https://www.google.com/recaptcha/api.js?render=${props.recaptchaKey}`}
            />
        </Head>
        <body>
            <SiteHeader baseUrl={props.baseUrl} />
            <main className="donate-page">
                <div className="donate-page-intro">
                    <div className="wrapper grid grid-cols-12">
                        <div className="donate-page-intro__content span-cols-5 span-sm-cols-12">
                            <h1 className="donate-page__title">
                                Help us do more
                            </h1>
                            <p className="article-block__text">
                                To bring about a better future, we need data and
                                research to understand the big problems the
                                world is facing and how to make progress against
                                them. That’s why we make all our work free and
                                accessible for everyone.
                            </p>
                            <p className="article-block__text">
                                We are a nonprofit. This means we rely on
                                donations and grants to keep us going. Reader
                                donations are essential to our work, providing
                                us with the stability and independence we need,
                                so we can focus on showing the data and evidence
                                we think everyone needs to know.
                            </p>
                            <p className="article-block__text">
                                Donating is also one way to show us that you
                                find our work helpful and valuable. Knowing this
                                is a huge source of inspiration for our team.
                            </p>
                            <p className="article-block__text">
                                If you want to help us do more, please donate
                                today – it will make a real difference.
                            </p>
                            <p className="article-block__text">
                                Thank you, <br />
                                <em>Global Change Data Lab</em> and the{" "}
                                <em>Our World in Data</em> team
                            </p>
                            <hr className="article-block__horizontal-rule" />
                            <aside className="donate-page__related-topics">
                                <h4 className="overline-black-caps">Related</h4>
                                <ul>
                                    <li>
                                        <a href="/about">About us</a>
                                    </li>
                                    <li>
                                        <a href="https://ourworldindata.org/uploads/2019/02/Donations-Policy-Global-Change-Data-Lab.pdf">
                                            Donations Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/donate/faq">Donations FAQ</a>
                                    </li>
                                </ul>
                            </aside>
                        </div>
                        <div className="col-start-7 span-cols-6 col-lg-start-7 span-lg-cols-6 col-md-start-6 span-md-cols-7 span-sm-cols-12">
                            <div className="donate-form-container">
                                {/* temporary message, client-side generated form */}
                                Loading donate form&hellip;
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter hideDonate={true} baseUrl={props.baseUrl} />

            <script
                type="module"
                dangerouslySetInnerHTML={{
                    __html: `runDonateForm()`,
                }}
            />
        </body>
    </html>
)
