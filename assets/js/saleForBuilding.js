
// 格式化统计单元格样式
var footerFormatter = (function(){
	var i = -1;
	return function(data) {
		if(FOOTER_DATA[++i]){
			return FOOTER_DATA[i].text + "(" + FOOTER_DATA[i].num + ")";
		}else{
			i = -1;
			return '';
		}
	}
})();

// 列默认值
var DEFAULT_VALUE = {
	align: "center",
	formatter: unitTextFormatter,
	cellStyle: unitClassFormatter,
	footerFormatter: footerFormatter
}



// 统计数据
var FOOTER_DATA = [
	{
		name : 'sale',
		text : '认购',
		className : 'info',
		num : 0
	},{
		name : 'sign',
		text : '签约',
		className : 'danger',
		num : 0
	},{
		name : 'keep',
		text : '未售',
		num : 0
	}
];


//设置项目下来列表
function loadProjectList(url) {
	doAjax({
		url: url
		//,type: 'POST'
		,data: {
			access_token: 'OIUE-ECNE-CHEO-BIUL'
			,UserID : ''
		}
	}, function(data) {
		data.unshift({
			name: "--请选择项目--",
			value: ''
		});
		setSelect("projectList", data, "", function(value) {
			$('#buildingList')[0].length = 1;
			$('#buildingList').change();
			value !== 'undefined' && loadBUildingList(URL_LIST.buildingList); // 加载楼栋列表
		});
	});
}

//设置楼栋下来列表
function loadBUildingList(url, projectId) {
	doAjax({
		url: url,
		data: {
			projectId: projectId
		}
	}, function(data) {
		data.unshift({
			name: "--请选择楼栋--",
			value: ''
		});
		setSelect("buildingList", data, "", function(value) {
			$('#unitsListTable').bootstrapTable('destroy');
			$('#buildingName').html('&nbsp;');
			value !== 'undefined' && loadUnitsList(URL_LIST.unitsList, value); // 加载户型数据
		});
	});
}

// 加载户型列表
function loadUnitsList(url, buildingId) {
	doAjax({
		url: url,
		data: {
			buildingId: buildingId
		}
	}, function(data) {
		$('#buildingName').html(data.buildingName);
		var columnsAndRows = getColumnsAndRows(data.houseType);
		// 渲染
		$('#unitsListTable').bootstrapTable({
			height: getHeight(),
			headerHeight: 55,
			columns: columnsAndRows.columns,
			data: columnsAndRows.rows,
			showFooter: true,
			showHeader: true
		});

	});
}

// getColumnsAndRows
function getColumnsAndRows(houseType) {
	var columns = [];
	var rows = [];
	for (var i = 0, j = houseType.length; i < j; i++) {
		columns.push($.extend({}, DEFAULT_VALUE, {
			field: "unitName_" + i,
			title: houseType[i].name + "<br/>" + houseType[i].area,
			cellFooterStyle: FOOTER_DATA[i] && FOOTER_DATA[i].className || '',	// zsk 扩展
		}));
		$.each(houseType[i].units, function(j, ele) {
			if (!rows[j]) {
				rows[j] = {}
			}
			rows[j]["unitName_" + i] = [ele.unitName, ele.saleStatus];
		});
	};
	return {
		columns: columns,
		rows: rows
	}
}



// 格式化单元格内容文本
function unitTextFormatter(value, row, index) {
	return value && value[0] || ""
}

// 格式化单元格样式
function unitClassFormatter(value, row, index, defaultValue) {
	if (defaultValue && defaultValue[1] == 1) { // 认购
		++FOOTER_DATA[0].num;
		return {classes: FOOTER_DATA[0].className}
	}

	if (defaultValue && defaultValue[1] == 2) { // 签约
		++FOOTER_DATA[1].num;
		return {classes:  FOOTER_DATA[1].className}
	}

	defaultValue && ++FOOTER_DATA[2].num;
	return {};	// 其他
}

// 表格的高度
function getHeight() {
	return $(window).height() - 90;
}