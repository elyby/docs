import React, {type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {Props} from '@theme/Footer/Copyright';

// Replaces the {year} placeholder in the copyright with the year of the build.
// The year is taken from the build time (not the client's clock) to avoid hydration mismatches
export default function FooterCopyright({copyright}: Props): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const year = String(siteConfig.customFields?.buildYear ?? new Date().getFullYear());

    return (
        <div
            className="footer__copyright"
            // Developer provided the HTML, so assume it's safe.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: copyright.replaceAll('{year}', year)}}
        />
    );
}
