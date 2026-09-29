import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import type { OptionField } from './GenericFunctions';
import { applyOptions, runActorAndGetItems } from './GenericFunctions';

// ScrapeUnblocker's public "AutoScout24 Car Scraper" Actor: https://apify.com/scrapeunblocker/autoscout24-scraper
const ACTOR_ID = 'lHbri7DcEgorAwt2Q';
const INTEGRATION_APP_ID = 'scrapeunblocker-autoscout24-scraper';

// Node option name -> Actor input key.
const OPTION_FIELDS: Record<string, OptionField> = {
	make: {
		key: 'make',
	},
	model: {
		key: 'model',
	},
	fuel: {
		key: 'fuel',
	},
	transmission: {
		key: 'transmission',
	},
	country: {
		key: 'country',
	},
	sort: {
		key: 'sort',
	},
	priceFrom: {
		key: 'price_from',
	},
	priceTo: {
		key: 'price_to',
	},
	yearFrom: {
		key: 'year_from',
	},
	yearTo: {
		key: 'year_to',
	},
	mileageTo: {
		key: 'mileage_to',
	},
	powerFrom: {
		key: 'power_from',
	},
	powerTo: {
		key: 'power_to',
	},
	powerUnit: {
		key: 'power_unit',
	},
	proxyCountry: {
		key: 'proxy_country',
		kind: 'upper',
	},
};

function buildActorInput(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	options: IDataObject,
	itemIndex: number,
): IDataObject {
	const input: IDataObject = {};

	switch (`${resource}:${operation}`) {
		case 'listing:search': {
			input.max_results = this.getNodeParameter('maxResults', itemIndex);
			break;
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${operation}" is not supported for resource "${resource}"`,
				{ itemIndex },
			);
	}

	applyOptions(input, options, OPTION_FIELDS);
	return input;
}

export class AutoScout24CarScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AutoScout24 Car Scraper',
		name: 'autoScout24CarScraper',
		icon: {
			light: 'file:autoScout24CarScraper.png',
			dark: 'file:autoScout24CarScraper.dark.png',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search AutoScout24 car listings across Europe with the ScrapeUnblocker Actor on Apify',
		defaults: {
			name: 'AutoScout24 Car Scraper',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Listing',
						value: 'listing',
					},
				],
				default: 'listing',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['listing'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search car listings by make, model and filters',
						action: 'Search listings',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 400,
				},
				default: 40,
				description: 'How many listings to collect across pages (about 20 per page, up to 400)',
				displayOptions: {
					show: {
						resource: ['listing'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'First Registration From (Year)',
						name: 'yearFrom',
						type: 'number',
						typeOptions: {
							minValue: 1900,
							maxValue: 2100,
						},
						default: 2018,
						description: 'Earliest year of first registration, e.g. 2018',
					},
					{
						displayName: 'First Registration To (Year)',
						name: 'yearTo',
						type: 'number',
						typeOptions: {
							minValue: 1900,
							maxValue: 2100,
						},
						default: 2026,
						description: 'Latest year of first registration, e.g. 2022',
					},
					{
						displayName: 'Fuel',
						name: 'fuel',
						type: 'options',
						options: [
							{
								name: 'Any',
								value: '',
							},
							{
								name: 'CNG',
								value: 'cng',
							},
							{
								name: 'Diesel',
								value: 'diesel',
							},
							{
								name: 'Electric',
								value: 'electric',
							},
							{
								name: 'Gasoline',
								value: 'gasoline',
							},
							{
								name: 'Hybrid (Electric/gasoline)',
								value: 'hybrid',
							},
							{
								name: 'LPG',
								value: 'lpg',
							},
						],
						default: '',
						description: 'Only cars with this fuel type',
					},
					{
						displayName: 'Make',
						name: 'make',
						type: 'string',
						default: '',
						placeholder: 'bmw',
						description:
							"Car make as written in AutoScout24 URLs, e.g. 'bmw', 'volkswagen' or 'mercedes-benz'. Leave empty for all makes.",
					},
					{
						displayName: 'Max Mileage (Km)',
						name: 'mileageTo',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 100000,
						description: 'Highest mileage to include, in km',
					},
					{
						displayName: 'Max Power',
						name: 'powerTo',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 150,
						description: 'Highest engine power, in the unit set by Power Unit',
					},
					{
						displayName: 'Max Price (EUR)',
						name: 'priceTo',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 20000,
						description: 'Highest price to include, in EUR',
					},
					{
						displayName: 'Min Power',
						name: 'powerFrom',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description: 'Lowest engine power, in the unit set by Power Unit',
					},
					{
						displayName: 'Min Price (EUR)',
						name: 'priceFrom',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description: 'Lowest price to include, in EUR',
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'string',
						default: '',
						placeholder: 'x5',
						description: "Model as written in AutoScout24 URLs, e.g. 'x5' or 'golf'. Needs a make.",
					},
					{
						displayName: 'Power Unit',
						name: 'powerUnit',
						type: 'options',
						options: [
							{
								name: 'Hp',
								value: 'hp',
							},
							{
								name: 'kW',
								value: 'kw',
							},
						],
						default: 'kw',
						description: 'Unit of Min Power and Max Power',
					},
					{
						displayName: 'Proxy Country',
						name: 'proxyCountry',
						type: 'string',
						default: '',
						placeholder: 'DE',
						description:
							'Exit-IP country as an ISO-2 code (e.g. DE). Leave empty for an automatically chosen exit.',
					},
					{
						displayName: 'Seller Country',
						name: 'country',
						type: 'options',
						options: [
							{
								name: 'Any',
								value: '',
							},
							{
								name: 'Austria',
								value: 'AT',
							},
							{
								name: 'Belgium',
								value: 'BE',
							},
							{
								name: 'France',
								value: 'FR',
							},
							{
								name: 'Germany',
								value: 'DE',
							},
							{
								name: 'Italy',
								value: 'IT',
							},
							{
								name: 'Luxembourg',
								value: 'LU',
							},
							{
								name: 'Netherlands',
								value: 'NL',
							},
							{
								name: 'Spain',
								value: 'ES',
							},
						],
						default: '',
						description: 'Only cars offered by sellers in this country',
					},
					{
						displayName: 'Sort By',
						name: 'sort',
						type: 'options',
						options: [
							{
								name: 'First Registration: Newest First',
								value: 'year_desc',
							},
							{
								name: 'Mileage: lowest first',
								value: 'mileage_asc',
							},
							{
								name: 'Newest Offers First',
								value: 'newest',
							},
							{
								name: 'Power: highest first',
								value: 'power_desc',
							},
							{
								name: 'Price: high to low',
								value: 'price_desc',
							},
							{
								name: 'Price: low to high',
								value: 'price_asc',
							},
							{
								name: 'Relevance',
								value: 'relevance',
							},
						],
						default: 'relevance',
						description: 'Result ordering',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							'Maximum run time of the Apify Actor run. 0 keeps the Actor default. A run that times out fails the node.',
					},
					{
						displayName: 'Transmission',
						name: 'transmission',
						type: 'options',
						options: [
							{
								name: 'Any',
								value: '',
							},
							{
								name: 'Automatic',
								value: 'automatic',
							},
							{
								name: 'Manual',
								value: 'manual',
							},
							{
								name: 'Semi-Automatic',
								value: 'semi-automatic',
							},
						],
						default: '',
						description: 'Only cars with this gearbox',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const { timeout, ...actorOptions } = options;

				const input = buildActorInput.call(this, resource, operation, actorOptions, i);
				const { items: results } = await runActorAndGetItems.call(this, {
					actorId: ACTOR_ID,
					integrationAppId: INTEGRATION_APP_ID,
					input,
					itemIndex: i,
					timeoutSecs: (timeout as number) || undefined,
				});

				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors return an error of their own class unchanged.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
