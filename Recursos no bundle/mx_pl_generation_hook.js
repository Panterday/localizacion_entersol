/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 * @NModuleScope Public
 */
define([
	'N/config',
	'N/format',
	'N/log',
	'N/record',
	'N/render',
	'N/runtime',
	'N/search',
	'./../templateGenerationHook/cfdi',
	'./../templateGenerationHook/customDataSource',
	'./../templateGenerationHook/customItems',
	'./../templateGenerationHook/legacyTax',
	'./../templateGenerationHook/rfc',
	'./../templateGenerationHook/SATCodes',
	'./../templateGenerationHook/satMappingLookup',
	'./../templateGenerationHook/suiteTax',
	'./../templateGenerationHook/summary',
	'./../templateGenerationHook/taxutils',
	'./../templateGenerationHook/withholdingTax',
	'./../templateGenerationHook/xmlGenerators/common',
	'./../templateGenerationHook/xmlGenerators/customerPayment',
	'./../../common/lib/search',
	'./../../common/sharedModuleFinder',
	'./../../common/localeCurrencyMap',
	'./../eiLogger',

], function (
	config,
	format,
	nsLog,
	record,
	render,
	runtime,
	search,
	cfdi,
	customDataSource,
	customItems,
	legacyTax,
	rfc,
	SATCodes,
	satMappingLookup,
	suiteTax,
	summary,
	taxUtils,
	whTax,
	CommonXmlGenerator,
	CustomerPaymentXmlGenerator,
	libSearch,
	sharedModuleFinder,
	localeCurrencyMap,
	eiLogger
) {
	function inject (obj) {
		nsLog.debug('Entry Point for EI Custom Data Source - Plugin Implementation BEGIN', JSON.stringify(obj));
		var recordsLoaded = {};
		var cfdiInstance = cfdi.getInstance(search, nsLog, libSearch);
		var rfcInstance = rfc.getInstance(config, record);
		var satCodesInstance = SATCodes.getInstance(
			cfdiInstance,
			search,
			satMappingLookup.getInstance(search, runtime),
			obj.transactionRecord
		);
		var legacyTaxInstance = legacyTax.getInstance(search, format, record);
		var whTaxInstance = whTax.getInstance(search, format, nsLog);
		var result = customDataSource.getInstance(
			CommonXmlGenerator.getInstance(
				cfdiInstance,
				customItems.getInstance(legacyTaxInstance, suiteTax.getInstance(search), whTaxInstance),
				libSearch,
				runtime,
				rfcInstance,
				satCodesInstance,
				sharedModuleFinder,
				summary.getInstance(taxUtils),
				whTaxInstance,
				nsLog
			),
			CustomerPaymentXmlGenerator.getInstance(
				cfdiInstance,
				rfcInstance,
				satCodesInstance,
				runtime,
				libSearch
			)
		).createCustomDataObject(obj, recordsLoaded);
		nsLog.debug('Exit Point for EI Custom Data Source - Plugin Implementation END ', result);
		try {
			_logInfoToKibana(obj);
		} catch (exception) {
			nsLog.error('Error MX EI Generation', 'Unable to log to Kibana ' + exception);
		}
		result.localeCurrencyMap = localeCurrencyMap;
		satMappingLookup.clearInstance(); // for Integration Tests
		return {
			customDataSources: [
				{
					format: render.DataSource.OBJECT,
					alias: 'custom',
					data: result,
				},
			],
		};
	}

	function _logInfoToKibana(obj) {
		var txnRecord = obj.transactionRecord;
		eiLogger.logInfoToKibana(
			'Generation',
			_getRecordType(txnRecord, obj.pdf),
			txnRecord.getValue('id'),
			'-',
			'-',
			'-',
			txnRecord
		);
	}

	function _getRecordType (txnRecord, isPdf) {
		var recordObj;
		if (isPdf) {
			recordObj = txnRecord;
		} else {
			recordObj = txnRecord.getRecord();
		}
		return recordObj.type;
	}

	return {
		inject: inject,
	};
});
