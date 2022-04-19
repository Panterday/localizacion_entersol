/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define([
	'./../../common/constants',
], function (constants) {
	'use strict';

	var proofTypeMap = {
		invoice: 'I',
		cashsale: 'I',
		creditmemo: 'E',
		itemfulfillment: 'T',
	};

	function SATCodes (cfdi, nsSearch, satMappingLookup, transactionRecord) {
		this.cfdi = cfdi;
		this.nsSearch = nsSearch;
		this.satMappingLookup = satMappingLookup;

		var items = [];
		var itemLineCount = transactionRecord.type === constants.RECORD_TYPE.CUSTOMER_PAYMENT
			? 0
			: transactionRecord.getLineCount({sublistId: 'item'});
		for (var index = 0; index < itemLineCount; index++) {
			items[index] = { taxes: [] };
		}
		this.satcodes = {
			items: items,
			paymentTermInvMap: {},
			paymentMethodInvMap: {},
			whTaxTypes: {},
			taxTypes: {},
			paymentTermSatCodes: {},
			paymentMethodCodes: {},
		};
		this.satItemCodesCache = {};
		this.satMappingValCache = {};
		this.satPaymentTermCache = {};
	}

	SATCodes.prototype.getSearchMapWithIdAsKey = function (searchType, columnsMap, ids) {
		var searchResult = {};
		var columns = Object.keys(columnsMap);
		var codeSearch = this.nsSearch.create({
			type: searchType,
			columns: columns,
			filters: ['internalid', 'anyof', ids],
		});
		var details;
		codeSearch.run().each(function (result) {
			details = {};
			columns.map(function (colname) {
				details[columnsMap[colname]] = result.getValue(colname);
			});
			searchResult[result.id + ''] = details;
			return true;
		});

		return searchResult;
	};

	SATCodes.prototype.getMexicoSatItemCode = function (id) {
		var strId = id + '';
		var cached = this.satItemCodesCache[strId];
		if (cached) {
			return cached;
		}
		var fields = this.nsSearch.lookupFields({
			id: id,
			type: 'customrecord_mx_sat_item_code_mirror',
			columns: ['custrecord_mx_ic_mr_code'],
		});

		var obj = {
			code: fields['custrecord_mx_ic_mr_code'],
		};
		this.satItemCodesCache[strId] = obj;
		log.debug('MX SAT Item Code :', obj);
		return obj;
	};

	SATCodes.prototype._getMexicoMappingValue = function (id) {
		var strId = '' + id;
		var cached = this.satMappingValCache[strId];
		if (cached) {
			return cached;
		}
		var fields = this.nsSearch.lookupFields({
			id: id,
			type: 'customrecord_mx_mapper_values',
			columns: ['custrecord_mx_mapper_value_inreport', 'name'],
		});

		var obj = {
			code: fields['custrecord_mx_mapper_value_inreport'],
			name: fields.name,
		};
		this.satMappingValCache[strId] = obj;
		log.debug('MX SAT Mapping Value Cache', obj);
		return obj;
	};

	SATCodes.prototype.getMexicoSatPaymentTerm = function (id) {
		var strId = '' + id;
		var cached = this.satPaymentTermCache[strId];
		if (cached) {
			return cached;
		}
		var fields = this.nsSearch.lookupFields({
			id: id,
			type: 'customrecord_mx_sat_payment_term',
			columns: ['custrecord_mx_sat_pt_code','name'],
		});

		var obj = {
			code: fields['custrecord_mx_sat_pt_code'],
			name : fields.name,
		};
		this.satPaymentTermCache[strId] = obj;
		log.debug('MX SAT Payment Term', obj);
		return obj;
	};

	SATCodes.prototype.getMexicoSatIndustryType = function (id) {
		var fields = this.nsSearch.lookupFields({
			id: id,
			type: 'customrecord_mx_sat_industry_type',
			columns: ['custrecord_mx_sat_it_code', 'name'],
		});

		var obj = {
			code: fields['custrecord_mx_sat_it_code'],
			name: fields.name,
		};
		log.debug('MX SAT Industry Type', obj);
		return obj;
	};

	SATCodes.prototype.getPaymentTerm = function (id, invoiceId) {
		if (!id) {
			return;
		}
		var obj = this.getMexicoSatPaymentTerm(id);
		var code = obj.code;
		if (invoiceId) {
			this.satcodes.paymentTermInvMap['d' + invoiceId] = code;
			return code;
		}
		this.satcodes.paymentTerm = code;
		this.satcodes.paymentTermName = obj.name;
		return code;
	};

	SATCodes.prototype.getPaymentStringTypeCode = function (paymentStringTypeId) {
		if (!paymentStringTypeId) {
			return;
		}

		var fields = this.nsSearch.lookupFields({
			id: paymentStringTypeId,
			type: 'customrecord_mx_sat_payment_string_type',
			columns: ['custrecord_mx_code', 'name'],
		});

		var obj = {
			code: fields['custrecord_mx_code'],
			name: fields.name,
		};

		this.satcodes.paymentStringTypeCode = obj.code;
		this.satcodes.paymentStringTypeName = obj.name;
		return obj.code;
	};

	SATCodes.prototype.getPaymentMethod = function (id, invoiceId) {
		if (!id) {
			return;
		}
		var obj = this._getMexicoMappingValue(id);
		if (invoiceId) {
			this.satcodes.paymentMethodInvMap['d' + invoiceId] = obj.code;
			return obj.code;
		}
		this.satcodes.paymentMethod = obj.code;
		this.satcodes.paymentMethodName = obj.name;
		return obj.code;
	};

	SATCodes.prototype.setPaymentTerm = function (satCode) {
		this.satcodes.paymentTerm = satCode;
	};

	SATCodes.prototype.getLineItemCode = function (lineNo, id) {
		if (!id) {
			return;
		}
		var lineSatCodes = this.satcodes.items[lineNo];
		lineSatCodes.itemCode = this.getMexicoSatItemCode(id).code;
	};

	SATCodes.prototype.getIndustryType = function (id) {
		if (!id) {
			return;
		}
		var obj = this.getMexicoSatIndustryType(id);
		this.satcodes.industryType = obj.code;
		this.satcodes.industryTypeName = obj.name;
	};

	SATCodes.prototype.getProofType = function (type) {
		this.satcodes.proofType = proofTypeMap[type];
	};

	SATCodes.prototype.pushForLineSatTaxCode = function (taxType, wh) {
		if (!taxType) {
			return;
		}
		this.satMappingLookup.needTaxCategory(taxType, wh);
	};

	SATCodes.prototype.pushForLineSatTaxFactorType = function (taxCode) {
		if (!taxCode) {
			return;
		}
		this.satMappingLookup.needTaxFactorType(taxCode);
	};

	SATCodes.prototype.fetchSatTaxCodesForAllPushed = function () {
		this.satcodes.whTaxTypes = this.satMappingLookup.getSatTaxCategories(true);
		this.satcodes.taxTypes = this.satMappingLookup.getSatTaxCategories(false);
	};

	SATCodes.prototype.fetchSatTaxFactorTypeForAllPushed = function () {
		this.satcodes.taxFactorTypes = this.satMappingLookup.getSatTaxFactorType();
	};

	SATCodes.prototype.fetchSatUnitCodesForAllPushed = function () {
		this.satcodes.unitCodes = this.satMappingLookup.getSatUnitCodes();
	};

	SATCodes.prototype.pushForLineSatUnitCode = function (unit) {
		if (!unit) {
			return;
		}
		this.satMappingLookup.needUnitCode(unit);
	};

	SATCodes.prototype.getJson = function () {
		return this.satcodes;
	};

	SATCodes.prototype.getTransactionLevelSatCodes = function (txnRecord, result) {
		var paymentTerm = txnRecord.getValue(constants.FIELD.MX_SAT_PAYMENT_TERM);
		var paymentMethod = txnRecord.getValue(constants.FIELD.MX_SAT_PAYMENT_METHOD);
		var cfdiUsageId = txnRecord.getValue(constants.FIELD.MX_CFDI_USAGE);

		if (txnRecord.type === constants.RECORD_TYPE.CREDIT_MEMO) {
			this.getPaymentMethod(result.firstRelatedCfdiTxn.paymentMethodId);
			this.setPaymentTerm('PUE');
		} else {
			this.getPaymentTerm(paymentTerm);
			this.getPaymentMethod(paymentMethod);
		}

		var obj = this.cfdi.getCfdiUsage(cfdiUsageId);
		if (obj) {
			this.satcodes.cfdiUsage = obj.code;
			this.satcodes.cfdiUsageName = obj.name;
		} else {
			this.satcodes.cfdiUsage = '';
			this.satcodes.cfdiUsageName = '';
		}
		this.getProofType(txnRecord.type);
	};

	function getInstance (cfdi, nsSearch, satMappingLookup, transactionRecord) {
		return new SATCodes(cfdi, nsSearch, satMappingLookup, transactionRecord);
	}

	return {
		getInstance: getInstance,
	};
});