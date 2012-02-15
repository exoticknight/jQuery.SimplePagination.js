/**
* jTbPage 1.0
* 当前版本：Beta
* Copyright (c) 2012 exoticknight https://exoticknight.github.com/jQuery.SimplyPagination.js
* Date: 2012-02-15
* 使用jTbPage可以将有表头的表格进行分页显示。
* 为方便各种场合使用，CSS没有进行专业设计，所以没有太多的限制。建议重新设计CSS样式，或者将类名称作为参数传入
* 请使用jQuery1.4以上版本
*/ 

if(jQuery)(
	function($) {
		/**
		*jTbPage
		*format the table
		*/
		$.fn.jTbPage = function(options) {
			$(this).each(function() {
				var settings = $.extend({
				id                    : $(this).attr('id'),//The ID of the table
				rows                : 10,//rows in one page
				sort                 : false,//need to sort or not
				navBtnText      : ['首页', '前一页', '后一页', '尾页'],//text of the four navigation button
				configBtnText   : '设置',//text of the config button
				btnClass          : 'jTbPage_btn_default',//CSS of the button
				btnHoverClass  : 'jTbPage_btn_hover_default',//CSS of the button when hovered
				selectClass       : 'jTbPage_page_select_default',//CSS of the page select
				btnbarClass     : 'jTbPage_btn_bar_default',
				alternateColor  : ['#FFF', '#DFDFDF', 'jTbPage_tr_hover_default'],//colors of odd and even rows(count from 0!) and class when being hovered
				speed              : 'slow',//speed of slide
				/*----AJAX setting----*/
				ajaxEnable      : false,
				script              : '',//the file receives query
				query              : '',//will submit a number
				/*-----------------------*/
				/*-------functions------*/
				fnOnInit          : null,//function to run when pagination is initialized
				fnCallback       : null//callback
				/*------------------------*/
				}, options);
				if($(this).data('settings')) return false;
				if(typeof settings.fnOnInit === 'function') settings.fnOnInit.call(this);
				if(this.nodeName != 'TABLE') {alert('Element should be <table>.');return false;}//element must be <table>
				if(!$(this).find('thead')[0]) {alert('Element should have a <thead>.');return false;}//need <thead>
				var numColumns = $('#' + settings.id).children('thead').children('tr').children().length;//get the sum of the columns
				var numRows = $('#' + settings.id).find('tbody').find('tr').length;//get the sum of the rows
				settings.repage = (numRows <= settings.rows) ? false : true;
				$('#' + settings.id).attr({
										'border' : '0',
										'cellpadding' : '0',
										'cellspacing' : '0'
										})
										.css('position', 'absolute');
				settings.trHeight = $('#' + settings.id).find('tbody').find('tr').outerHeight();//save the height of one row in <tbody>
				settings.thHeight = $('#' + settings.id).find('thead').find('tr').outerHeight();//save the height of <thead>
				$(this).data('settings', settings);//cache of settings
				$(this).attr({border : 0, cellpadding : 0, cellspacing : 0});
				var numPages = Math.ceil(numRows / settings.rows);//calculate the number of pages
				var tbHeight = settings.repage ? settings.trHeight * settings.rows : settings.trHeight * numRows;//calculate the height of one page
				//create the navigation button
				if (settings.repage) {
					/**
					*creat buttons with the passing parameters
					*STRING sText
					*ARRAY aClass
					*/
					var fnCreatBtn = function(sText, aClass) {
						var _tempBtn = $('<div>' + sText + '</div>');
						var _len = aClass.length;
						for(i = 0; i < _len; ++i) {
							_tempBtn.addClass(aClass[i]);
						}
						return _tempBtn;
					}
					//creat the navigation buttons
					var navBtnFirst = fnCreatBtn(settings.navBtnText[0], [settings.btnClass]);
					navBtnFirst.attr('id', 'goto_first');
					var navBtnPrev = fnCreatBtn(settings.navBtnText[1], [settings.btnClass]);
					navBtnPrev.attr('id', 'goto_previous');
					var navBtnNext = fnCreatBtn(settings.navBtnText[2], [settings.btnClass]);
					navBtnNext.attr('id', 'goto_next');
					var navBtnLast = fnCreatBtn(settings.navBtnText[3], [settings.btnClass]);
					navBtnLast.attr('id', 'goto_last');
					var configBtn = fnCreatBtn(settings.configBtnText, [settings.btnClass]);
					configBtn.attr('id', 'config_button');
					//creat the page select
					var pageSelect = $('<select></select>').attr({'name' : 'pageSelect', 'id' : 'pageSelect'}).addClass(settings.selectClass);
					for (_page = 0; _page < numPages; ++_page) {
						$('<option></option>')
							.attr('value', _page+1)
							.text(_page + 1)
							.appendTo(pageSelect);
					}
					//bind the 'change' functions to the <select>
					pageSelect.change(function() {
						me.jTableNav($(this).val());
					});
					//bind the 'cilck' functions to the buttons
					/*
					the code:
					pageSelect.trigger('change')
					is improtant!
					*/
					navBtnFirst.click(function() {pageSelect.children('option').first().attr('selected', true);pageSelect.trigger('change')});
					navBtnPrev.click(function() {pageSelect.children('option:selected').prev().attr('selected', true);pageSelect.trigger('change')});
					navBtnNext.click(function() {pageSelect.children('option:selected').next().attr('selected', true);pageSelect.trigger('change')});
					navBtnLast.click(function() {pageSelect.children('option').last().attr('selected', true);pageSelect.trigger('change')});
					configBtn.click(function() {alert('这部分暂时还没有开发>_<')});
					//wraper of buttons
					var btn_bar = $('<ul></ul>').attr('id' , settings.id + '_button_list');
					for(i=0;i<6;i++) btn_bar.append('<li></li>');
					//append all the components
					btn_bar.children().eq(0).append(navBtnFirst);
					btn_bar.children().eq(1).append(navBtnPrev);
					btn_bar.children().eq(2).append(pageSelect).append('<label>of ' + numPages + '</label>');
					btn_bar.children().eq(3).append(navBtnNext);
					btn_bar.children().eq(4).append(navBtnLast);
					btn_bar.children().eq(5).append(configBtn);
					//add border
					btn_bar.children().addClass('button_bar_divition');
					//bind the 'hover' functions to the buttons
					btn_bar.find('div.'+settings.btnClass).each(function() {
						var _temp = $(this);
						_temp.hover(
							function() {
								_temp.addClass(settings.btnHoverClass);
								//or some other codes here
							},
							function() {
								_temp.removeClass(settings.btnHoverClass);
								//or some other codes here
							});
					});
					btn_bar = $('<div></div>').attr('id', settings.id + '_button_bar_wrap').addClass(settings.btnbarClass).append(btn_bar);
				}
				//format the table
				var me = $(this);
				//decorate the table
				me.children('tbody').children('tr:odd').css('background-color' , settings.alternateColor[0]);
				me.children('tbody').children('tr:even').css('background-color' , settings.alternateColor[1]);
				me.children('tbody').children('tr').each(function() {
					var _temp = $(this);
					_temp.css('cursor', 'pointer');
					_temp.mouseover(
						function() {
							_temp.addClass(settings.alternateColor[2]);
						});
					_temp.mouseout(
						function() {
							_temp.removeClass(settings.alternateColor[2]);
						});
				});
				//create a new table
				var newTable = $('<table><tbody><tr><td></td></tr></tbody><tbody><tr><td></td></tr></tbody></table>');
				newTable.attr({
							'id' : settings.id + '_wrap_table',
							'border' : '0',
							'cellpadding' : '0',
							'cellspacing' : '0'
							})
							.insertBefore(me);
				//clone the <thead>
				$('<table></table>').attr({
						'id' : settings.id + '_headline_table',
						'border' : '0',
						'cellpadding' : '0',
						'cellspacing' : '0'
						})
						.append(me.children('thead').clone())
						.appendTo(newTable.children('tbody').eq(0).find('td'));
				//create a wrap for the old table
				$('<div></div>')
						.css({
						height : tbHeight + 'px',
						display : 'block',
						position : 'relative',
						overflow : 'hidden'
						})
						.append(me)
						.appendTo(newTable.children('tbody').eq(1).find('td'));
				//append the navigation button
				if (settings.repage) {
					newTable.wrap('<div id="' + settings.id + '_main_wrap"></div>');
					//append the new table and buttons' list
					btn_bar.insertAfter(newTable);
					newTable.parent().css('width', Math.max(newTable.outerWidth(), btn_bar.outerWidth()));
				}else{
					newTable.wrap('<div id="' + settings.id + '_main_wrap"></div>');
				}
				//hide the <thead> of the old table
				me.css('top', '-' + settings.thHeight+ 'px');
				//callback
				if(typeof settings.fnCallback === 'function') settings.fnCallback.call(this);
			});
		};
		/**
		*jTableNav
		*slide to the required page
		*/
		$.fn.jTableNav = function(index) {
			if(!index) return false;
			var settings = $(this).data('settings');
			//if(settings.ajaxEnable) {}
			$(this).animate({top:"-"+((index - 1) * settings.trHeight * settings.rows + settings.thHeight)+"px"},'slow');
		};
		/**
		*jTableNav.sort
		*sort the table
		*/
		$.fn.jTableNav.sort = function() {
		alert('alert');
		};
		/**
		*jTableNav.ajaxGet
		*
		*/
		$.fn.jTableNav.ajaxGet = function() {
		};
})(jQuery);