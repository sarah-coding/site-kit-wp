/**
 * DashboardPopularKeywordsWidget component.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { STORE_NAME } from '../../datastore/constants';
import { STORE_NAME as CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
import { STORE_NAME as CORE_USER } from '../../../../googlesitekit/datastore/user/constants';
import { numberFormat } from '../../../../util';
import { getDataTableFromData, TableOverflowContainer } from '../../../../components/data-table';
import whenActive from '../../../../util/when-active';
import PreviewTable from '../../../../components/preview-table';
import ErrorText from '../../../../components/error-text';
import Layout from '../../../../components/layout/layout';
const { useSelect } = Data;

function DashboardPopularKeywordsWidget() {
	const {
		data,
		error,
		baseServiceURL,
		searchConsolePropertyMainURL,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		const domain = store.getPropertyID();
		const args = {
			dateRange: select( CORE_USER ).getDateRange(),
			dimensions: 'query',
			limit: 10,
		};

		const url = select( CORE_SITE ).getCurrentEntityURL();
		if ( url ) {
			args.url = url;
		}

		return {
			data: store.getReport( args ),
			error: store.getErrorForSelector( 'getReport', [ args ] ),
			baseServiceURL: store.getServiceURL( {
				path: '/performance/search-analytics',
				query: {
					resource_id: domain,
					num_of_days: 28,
				},
			} ),
			searchConsolePropertyMainURL: store.getServiceURL( {
				query: {
					resource_id: domain,
				},
			} ),
		};
	} );

	if ( error ) {
		return (
			<div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
				<ErrorText message={ error.message } />
			</div>
		);
	}

	if ( ! Array.isArray( data ) ) {
		return <PreviewTable padding />;
	}

	if ( ! data.length ) {
		return null;
	}

	const headers = [
		{
			title: __( 'Keyword', 'google-site-kit' ),
			tooltip: __( 'Most searched for keywords related to your content', 'google-site-kit' ),
			primary: true,
		},
		{
			title: __( 'Clicks', 'google-site-kit' ),
			tooltip: __( 'Number of times users clicked on your content in search results', 'google-site-kit' ),
		},
		{
			title: __( 'Impressions', 'google-site-kit' ),
			tooltip: __( 'Counted each time your content appears in search results', 'google-site-kit' ),
		},
	];

	const links = [];
	const dataMapped = data.map( ( row, i ) => {
		const query = row.keys[ 0 ];
		links[ i ] = addQueryArgs( baseServiceURL, { query } );
		return [
			query,
			numberFormat( row.clicks ),
			numberFormat( row.impressions ),
		];
	} );

	const options = {
		hideHeader: false,
		chartsEnabled: false,
		links,
	};

	const dataTable = getDataTableFromData( dataMapped, headers, options );

	return (
		<Layout
			className="googlesitekit-popular-content"
			footer
			footerCtaLabel={ _x( 'Search Console', 'Service name', 'google-site-kit' ) }
			footerCtaLink={ searchConsolePropertyMainURL }
			fill
		>
			<TableOverflowContainer>
				{ dataTable }
			</TableOverflowContainer>
		</Layout>
	);
}

export default whenActive( { moduleName: 'search-console' } )( DashboardPopularKeywordsWidget );