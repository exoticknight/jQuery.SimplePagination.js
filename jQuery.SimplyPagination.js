/**
* jTbPage 0.5
* 当前版本：Beta
* Copyright (c) 2012 exoticknight http://exoticknight.github.com/
* Date: 2012-02-06
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
				navBtnText       : ['<<', '<', '>', '>>'],//text of the three navigation button
				btnClass           : 'btn_default',//CSS of the button
				btnHoverClass   : 'btn_hover_default',//CSS of the button when hovered
				selectClass       : 'page_select_default',//CSS of the page select
				btnListClass      : 'btn_list_default',
				alternateColor   : ['#222', '#000'],//colors of odd and even rows
				speed              : 'slow',//speed of slide
				/*----AJAX setting----*/
				ajaxEnable       : false,
				script               : '',//the file receives query
				query               : '',//will submit a number
				/*-----------------------*/
				/*-------functions------*/
				fnOnInit           : null,//function to run when pagination is initialized
				fnCallback        : null//callback
				/*------------------------*/
				}, options);
				if(typeof settings.fnOnInit === 'function') settings.fnOnInit.call(this);
				if(this.nodeName != 'TABLE') return false;//element must be <table>
				if(!$(this).find('thead')[0]) return false;//need <thead>
				var numColumns = $('#' + settings.id).find('thead').find('th').length;//get the sum of the columns
				var numRows = $('#' + settings.id).find('tbody').find('tr').length;//get the sum of the rows
				if (numRows <= settings.rows) return false;//no need for pagination
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
				var tbHeight = settings.trHeight * settings.rows;//calculate the height of one page
				/**
				*creat buttons with the passing parameters
				*STRING sText
				*ARRAY aClass
				*/
				var fnCreatBtn = function(sText, aClass) {
					var _tempBtn = $('<button>' + sText + '</button>');
					for(i = 0; i < aClass.length; ++i) {
						_tempBtn.addClass(aClass[i]);
					}
					return _tempBtn;
				}
				//creat the navigation buttons
				var navBtnFirst = fnCreatBtn(settings.navBtnText[0], [settings.btnClass, 'btn_current']);
				navBtnFirst.attr('id', 'gotoFirst');
				var navBtnPrev = fnCreatBtn(settings.navBtnText[1], [settings.btnClass, 'btn_current']);
				navBtnPrev.attr('id', 'gotoPrev');
				var navBtnNext = fnCreatBtn(settings.navBtnText[2], [settings.btnClass, 'btn_current']);
				navBtnNext.attr('id', 'gotoNext');
				var navBtnLast = fnCreatBtn(settings.navBtnText[3], [settings.btnClass, 'btn_current']);
				navBtnLast.attr('id', 'gotoLast');
				//creat the page select
				var pageSelect = $('<select></select>').attr({'name' : 'pageSelect', 'id' : 'pageSelect'}).addClass(settings.selectClass);
				for (_page = 0; _page < numPages; ++_page) {
					$('<option></option>')
						.attr('value', _page+1)
						.text(_page + 1)
						.appendTo(pageSelect);
				}
				//wraper of buttons
				var btn_list = $('<ul></ul>').attr('id' , settings.id + '_button_list').addClass(settings.btnListClass);
				for(i=0;i<5;i++) btn_list.append('<li></li>');
				//append all the components
				btn_list.children().eq(0).append(navBtnFirst);
                btn_list.children().eq(1).append(navBtnPrev);
				btn_list.children().eq(2).append(pageSelect).append('<label>of ' + numPages + '</label>');
				btn_list.children().eq(3).append(navBtnNext);
				btn_list.children().eq(4).append(navBtnLast);
				//bind the 'hover' functions to the buttons
				btn_list.find('button').each(function() {
					var _temp = $(this);
					_temp.hover(
						function() {
							_temp.addClass(settings.btnHoverClass);
							//or some other codes here
						},
						function() {
							_temp.removeClass(settings.btnHoverClass);
							//or some other codes here
						}
					);
				});
				//bind the 'change' functions to the <select>
				var me = $(this);
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
				//create a new table
				var newTable = $('<table><tbody><tr><td colspan=' + numColumns + '></td></tr></tbody></table>');
				newTable.attr({
							'border' : '0',
							'cellpadding' : '0',
							'cellspacing' : '0'
							})
							.insertBefore(me);
				//clone the <thead>
				me.children('thead').clone().appendTo(newTable);
				//create a wrap for the old table
				$('<div></div>')
						.css({
						height : tbHeight + 'px',
						display : 'block',
						position : 'relative',
						overflow : 'hidden'
						})
						.append(me)
						.appendTo(newTable.find('td'));
				//append the buttons
				btn_list.insertAfter(newTable);
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
		*define the algorithm of sort
		*/
		$.fn.jTableNav.sort = function() {
		};
		/**
		*jTableNav.ajaxGet
		*
		*/
		$.fn.jTableNav.ajaxGet = function() {
		};
})(jQuery);