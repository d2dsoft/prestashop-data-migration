
/* eslint-disable */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if (typeof jQuery === 'undefined') {
                // require('jQuery') returns a factory that requires window to build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop if it's defined (how jquery works)
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    /* eslint-enable */
    'use strict';
    $.extend({
        MigrationData: function(options){
            var defaults = {
                url: 'index.php',
                request_post: {},
                request_download: {}
            };
            var settings = $.extend(defaults, options);
            var container = '#migration-page';

            function getRequestPost(){
                return settings.request_post;
            }

            function getRequestDownload(){
                return settings.request_download;
            }

            function getRetryMessage(console){
                if(console == undefined){
                    console = false;
                }
                if(console){
                    return '<p class="error">Request timeout or server isn\'t responding, please try again.</p>';
                }
                return 'Request timeout or server isn\'t responding, please try again.';
            }

            function showAlert(message){
                if(typeof bootbox != 'undefined'){
                    bootbox.alert(message);
                } else {
                    alert(message);
                }
            }

            function showBox(type, html){
                var id = '#' + type + '-wrap';
                var box = $(id, container);
                if(box.length > 0){
                    $('.wrap-box', container).css('display', 'none');
                    if(html != undefined){
                        box.html(html);
                        $('.select2', box).select2({width: '100%'});
                        $('.platform-select2', box).select2({
                            width: '100%',
                            templateResult: platformSelectTemplateResult,
                            templateSelection: platformSelectTemplateSelection,
                            theme: 'default platform-select2-container'
                        });
                    }
                    box.css('display', 'block');
                    $(window).scrollTop($('#migration-page').offset().top);
                }
            }

            function showBoxAction(type, action){
                var id_wrap = '#' + type + '-wrap .box-action';
                var class_action = '.' + action + '-action';
                $(id_wrap).find(class_action).css('visibility', 'visible');
            }

            function hiddenBoxAction(type, action){
                var id_wrap = '#' + type + '-wrap';
                var class_action = '.' + action + '-action';
                $(id_wrap).find(class_action).css('visibility', 'hidden');
            }

            function activeMenu(step){
                var prefix = '#migration-';
                var active_id = prefix + step;
                var active = $(active_id);
                if(active.length > 0){
                    $('.nav-process .menu-step', container).removeClass('active done');
                    active.addClass('active');
                    var step_index = active.data('step');
                    for(var i = 1; i < step_index; i++){
                        var done_id = prefix + 'step' + i;
                        $(done_id, container).addClass('done');
                    }
                }
            }

            function callProcess(url, data){
                var request_post = getRequestPost();
                var params = $.extend(data, request_post);
                var aDeferred = $.Deferred();
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    data: params,
                    success: function(response, status, xhr){
                        aDeferred.resolve(response, status, xhr);
                    },
                    error: function (xhr, status, error) {
                        aDeferred.reject(xhr, status, error);
                    }
                });
                return aDeferred.promise();
            }

            function objectifyForm(form, extend) {
                var formArray = form.serializeArray();
                var returnArray = {};
                var input_name = '', input_value = '';
                for (var i = 0; i < formArray.length; i++){
                    input_name = formArray[i]['name'];
                    input_value = formArray[i]['value'];
                    if(input_name.indexOf('[]') != -1){
                        input_name = input_name.replace('[]', '');
                        if(returnArray[input_name] == undefined){
                            returnArray[input_name] = [];
                        }
                        returnArray[input_name].push(input_value);
                    } else {
                        returnArray[input_name] = input_value;
                    }
                }
                if(extend != undefined){
                    returnArray = $.extend(extend, returnArray);
                }
                return returnArray;
            }

            function buildQuery(data) {
                return Object.keys(data).map(function(key) {
                    return [key, data[key]].map(encodeURIComponent).join("=");
                }).join("&");
            }

            function genToken() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 10; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }

            function showLoading(){
                $('#loading', container).css({display: 'block'});
            }

            function hideLoading(){
                $('#loading', container).css({display: 'none'});
            }

            function storageData(){
                createCookie(1);
                var request_post = getRequestPost();
                var data = $.extend({process: 'stored'}, request_post);
                callProcess(settings.url, data).done(function(response){
                    if(response.message){
                        consoleMessage('#storage-wrap .console-box', response.message);
                    }
                    if(response.status == 'finish'){
                        deleteCookie();
                        $(container).find('#storage-wrap .next-action').trigger('click');
                    } else if(response.status == 'error'){
                        showBoxAction('storage', 'retry');
                    } else {
                        storageData();
                    }
                }).fail(function(xhr, status, error){
                    consoleMessage('#storage-wrap .console-box', getRetryMessage(true));
                    showBoxAction('storage', 'retry');
                });
            }

            function consoleMessage(elementId, message){
                var element = $(elementId);
                if(element.length > 0){
                    element.append(message);
                    element.animate({scrollTop: element.prop("scrollHeight")});
                }
            }

            function getFormValidateRule(form){
                var rules = {};
                form.find('.validate-rule').each(function(index, value){
                    var rule = $(this).data('rules');
                    $.extend(rules, rule);
                });
                return rules;
            }

            function resetFormValidate(form){
                form.removeData('validator');
                return true;
            }

            function showFormValidate(elementId, html, type){
                var element_id = elementId.replace('#', '');
                var element = $(elementId);
                if(element.length > 0){
                    var nextElement, validate_html;
                    if(type == 'current'){
                        nextElement = element.next();
                        if(nextElement.hasClass('message-valid')){
                            nextElement.html(html).css({display: 'block'});
                        } else {
                            validate_html = '<label id="' + element_id + '-error" class="message-valid" for="' + element_id + '">' + html + '</label>';
                            nextElement = $(validate_html);
                            element.after(nextElement);
                        }
                    } else {
                        var parent = element.parent();
                        nextElement = parent.find('.message-valid');
                        if(nextElement.length > 0){
                            nextElement.html(html).css({display: 'block'});
                        } else {
                            validate_html = '<label id="' + element_id + '-error" class="message-valid" for="' + element_id + '">' + html + '</label>';
                            nextElement = $(validate_html);
                            parent.append(nextElement);
                        }
                    }

                }
            }

            function validateSelectRequired(elementId){
                var element = $(elementId);
                if(element.length < 0){
                    return true;
                }
                var result = false;
                $('select', element).each(function(index, value) {
                    var elm_val = $(value).val();
                    if(elm_val){
                        result = true;
                    }
                });
                if(!result){
                    $('.message-valid', element).html('You must select at least one!').show();
                    scrollToErrorMessage(element);
                }
                return result;
            }

            function validateSelectDuplicate(elementId){
                var element = $(elementId);
                if(element.length < 0){
                    return false;
                }
                var check = new Array();
                $('select', element).each(function(index, value) {
                    var elm_val = $(value).val();
                    var elm_opt = $(value).find(':selected');
                    var duplicate = elm_opt.data('duplicate');
                    if(duplicate == undefined || !duplicate){
                        duplicate = 0;
                    }
                    if(elm_val && duplicate == 0){
                        check[index] = elm_val;
                    }
                });
                var result = false;
                check.forEach(function(value, index) {
                    check.forEach(function(value_tmp, index_tmp) {
                        if (value_tmp === value && index !== index_tmp) {
                            result = true;
                        }
                    });
                });
                if(result){
                    $('.message-valid', element).html('Mapping value can\'t not be the same. Please change!').show();
                    scrollToErrorMessage(element);
                }
                return result;
            }

            function validateSelectsDuplicate(elementClass){
                var elements = $(elementClass);
                if(elements.length < 0){
                    return false;
                }
                var resultAll = false;
                elements.each(function(i, v){
                    var element = $(v);
                    var check = new Array();
                    $('select', element).each(function(index, value) {
                        var elm_val = $(value).val();
                        var elm_opt = $(value).find(':selected');
                        var duplicate = elm_opt.data('duplicate');
                        if(duplicate == undefined || !duplicate){
                            duplicate = 0;
                        }
                        if(elm_val && duplicate == 0){
                            check[index] = elm_val;
                        }
                    });
                    var result = false;
                    check.forEach(function(value, index) {
                        check.forEach(function(value_tmp, index_tmp) {
                            if (value_tmp === value && index !== index_tmp) {
                                result = true;
                            }
                        });
                    });
                    if(result){
                        $('.message-valid', element).html('Mapping value can\'t not be the same. Please change!').show();
                        scrollToErrorMessage(element);
                        resultAll = true;
                    }
                });
                return resultAll;
            }

            function validateCustomFieldMapType(){
                var elements = $('.cf-section-entity-map', container);
                if(elements.length < 0){
                    return false;
                }
                var resultAll = false;
                elements.each(function(i, v){
                    var element = $(v);
                    var result = false;
                    $('.form-group', element).each(function(i1, v1){
                        var group = $(v1);
                        var sf = group.find('.cf_source');
                        var tf = group.find('.cf_target');
                        if(!sf.length || !tf.length){
                            return true;
                        }
                        var sfo = sf.find(':selected');
                        var tfo = tf.find(':selected');
                        var st = sfo.data('columnType');
                        var tt = tfo.data('columnType');
                        var sdt = sfo.data('detailType');
                        var tdt = tfo.data('detailType');
                        var check = (sdt == tdt);
                        if(check){
                            if(!st || !tt || st == tt){
                                return true;
                            }
                        }
                        check = isDbTypeMapRight(st, tt);
                        if(!check){
                            $('.message-item-valid', group).html('Mapping type must be the similar. Please change!').show();
                            result = true;
                            return false;
                        }
                    });
                    if(result){
                        scrollToElement(element);
                        resultAll = true;
                    }
                });
                return resultAll;
            }

            function isDbTypeMapRight(source_type, target_type){
                if(source_type == target_type){
                    return true;
                }
                var supports = {
                    'int': ['tinyint', 'smallint', 'mediumint'],
                    'bigint': ['int', 'tinyint', 'smallint', 'mediumint'],
                    'double': ['float'],
                    'decimal': ['double', 'float'],
                    'datetime': ['date'],
                    'varchar': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char'],
                    'mediumtext': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char', 'varchar', 'tinytext'],
                    'text': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char', 'varchar', 'tinytext', 'mediumtext'],
                    'longtext': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char', 'varchar', 'tinytext', 'mediumtext', 'text'],
                    'mediumblob': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char', 'varchar', 'tinytext', 'mediumtext', 'text', 'tinyblob'],
                    'blob': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char', 'varchar', 'tinytext', 'mediumtext', 'text', 'tinyblob', 'mediumblob'],
                    'longblob': ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'time', 'year', 'char', 'varchar', 'tinytext', 'mediumtext', 'text', 'tinyblob', 'mediumblob', 'blob']
                };
                if(supports[target_type] == undefined){
                    return false;
                }
                var support = supports[target_type];
                return (support.indexOf(source_type) != -1);
            }

            function validateCheckRequired(elementId){
                var element = $(elementId);
                if(element.length < 0){
                    return true;
                }
                if($('input:checkbox:checked', element).length > 0){
                    return true;
                }
                $('.message-valid', element).html('You must select at least one!').show();
                scrollToErrorMessage(element);
                return false;
            }

            function resetValidate(elementId){
                $('.message-valid', elementId).hide();
                $('.message-item-valid', elementId).hide();
            }

            function scrollToErrorMessage(element){
                if(element.length < 1){
                    return false;
                }
                $(window).scrollTop( $('.message-valid', element).offset().top - $(window).height() + 50);
            }

            function scrollToElement(element){
                $(window).scrollTop(element.offset().top + 50);
            }

            function createCookie(value) {
                var date = new Date();
                date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
                document.cookie = "migration_process=" + value + expires + "; path=/";
            }

            function getCookie() {
                var nameEQ = "migration_process=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ')
                        c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0)
                        return c.substring(nameEQ.length, c.length);
                }
                return null;
            }

            function deleteCookie() {
                var date = new Date();
                date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
                document.cookie = "migration_process=" + expires + "; path=/";
            }

            function checkCookie() {
                var check = getCookie();
                var result = false;
                if (check === '1') {
                    result = true;
                }
                return result;
            }

            function prepareImport(){
                createCookie(1);
                var request_post = getRequestPost();
                var data = $.extend({process: 'prepare'}, request_post);
                callProcess(settings.url, data).done(function(response){
                    if(response.message){
                        consoleMessage('#import-wrap .console-box', response.message);
                    }
                    if(response.status == 'success'){
                        deleteCookie();
                        clearData();
                    } else {
                        showBoxAction('import', 'retry');
                    }
                }).fail(function(xhr, status, error){
                    consoleMessage('#import-wrap .console-box', getRetryMessage(true));
                    showBoxAction('import', 'retry');
                });
            }

            function clearData(){
                createCookie(1);
                var request_post = getRequestPost();
                var data = $.extend({process: 'clear'}, request_post);
                var wrap;
                callProcess(settings.url, data).done(function(response){
                    if(response.message){
                        consoleMessage('#import-wrap .console-box', response.message);
                    }
                    if(response.status == 'finish'){
                        deleteCookie();
                        wrap = $('#clear-process', container);
                        wrap.find('.processing-wrap').hide();
                        wrap.find('.success-wrap').show();
                        wrap.find('.result-action').hide();
                        importEntity();
                    } else if(response.status == 'process') {
                        clearData();
                    } else {
                        wrap = $('#clear-process', container);
                        wrap.find('.processing-wrap').hide();
                        wrap.find('.success-wrap').hide();
                        wrap.find('.result-action').show();
                    }
                }).fail(function(xhr, status, error){
                    consoleMessage('#import-wrap .console-box', getRetryMessage(true));
                    wrap = $('#clear-process', container);
                    wrap.find('.processing-wrap').hide();
                    wrap.find('.success-wrap').hide();
                    wrap.find('.result-action').show();
                });
            }

            function importEntity(type){
                createCookie(1);
                if(type == undefined){
                    type = getEntityStart();
                    processBarAnimate(type, false);
                }
                var request_post = getRequestPost();
                var data = $.extend({process: 'import'}, request_post);
                callProcess(settings.url, data).done(function(response){
                    if(response.message){
                        consoleMessage('#import-wrap .console-box', response.message);
                    }
                    if(response.status == 'finish'){
                        deleteCookie();
                        //showBoxAction('import', 'next');
                        $('#import-wrap .next-action', container).trigger('click');
                    } else if (response.status == 'success'){
                        var result = response.data;
                        processBarResult(result.type, result.total, result.import, result.error, result.point);
                        processBarAnimate(result.type, true);
                        if(result.next_type){
                            processBarAnimate(result.next_type, false);
                        }
                        delayImportEntity(result.next_type);
                    } else if(response.status == 'process'){
                        var result = response.data;
                        processBarResult(result.type, result.total, result.import, result.error, result.point);
                        processBarAnimate(result.type, false);
                        delayImportEntity(result.type);
                    } else {
                        processRetry(type);
                    }
                }).fail(function(xhr, status, error){
                    consoleMessage('#import-wrap .console-box', getRetryMessage(true));
                    processRetry(type);
                });
            }

            function delayImportEntity(type){
                importEntity(type);
                /*var time = parseFloat(settings.delay);
                if(time > 0){
                    var delay = time * 1000;
                    setTimeout(function(){
                        importEntity(type);
                    }, delay);
                } else {
                    importEntity(type);
                }*/
            }

            function processBarResult(entity, total, imported, error, point)
            {
                var id = '#import-wrap #' + entity + '-process';
                var wrap = $(id, container);
                if(wrap.length < 1){
                    return false;
                }
                var result = 'Imported: ' + imported + '/' + total + ', Error: ' + error;
                wrap.find('.process-group .result-info').html(result);
                var process_bar = wrap.find('.process-group .progress-bar');
                process_bar.css({width: point + '%'});
            }

            function processBarAnimate(entity, success)
            {
                var id = '#import-wrap #' + entity + '-process';
                var wrap = $(id, container);
                if(wrap.length < 1){
                    return false;
                }
                var process_bar = wrap.find('.process-group .progress-bar');
                if(success){
                    process_bar.addClass('progress-pause').addClass('progress-success');
                } else {
                    process_bar.removeClass('progress-pause').removeClass('progress-success');
                }
            }

            function processRetry(entity)
            {
                var id = '#import-wrap #' + entity + '-process';
                var wrap = $(id, container);
                if(wrap.length < 1){
                    return false;
                }
                wrap.find('.retry-group').show();
                registerAutoRetry(entity);
            }

            function registerAutoRetry(entity){
                var time = parseFloat(settings.retry);
                if(time > 0){
                    time = time * 1000;
                    setTimeout(function(){
                        var process_id = '#' + entity + '-process';
                        var wrap = $(process_id).find('.retry-group');
                        if(wrap.is(':visible')){
                            var button = $(process_id).find('.retry-action');
                            button.trigger('click');
                        }
                    }, time);
                }
            }

            function getEntityStart()
            {
                var wrap = $('#import-wrap .entity-process:first', container);
                if(wrap.length < 1){
                    return '';
                }
                return wrap.data('entity');
            }

            function platformSelectTemplateResult(item){
                if (!item.id) {
                    return item.text;
                }
                var result = $('<span class="platform-icon-base platform-icon-' + item.id + '">' + item.text + '</span>');
                return result;
            }

            function platformSelectTemplateSelection(item){
                if (!item.id) {
                    return item.text;
                }
                var result = $('<span class="platform-icon-base platform-icon-' + item.id + '">' + item.text + '</span>');
                return result;
            }

            function styleTable(element){
                var i = 0;
                $('.form-group', element).each(function(i, v){
                    $(v).removeClass('even').removeClass('odd');
                    var style_class = '';
                    if(i%2){
                        style_class = 'odd';
                    } else {
                        style_class = 'even';
                    }
                    $(v).addClass(style_class);
                    i++;
                });
            }

            function activeValidateExtra(element){
                element.addClass('section-validate-extra');
            }

            function deactivateValidateExtra(element){
                element.removeClass('section-validate-extra');
            }

            function registerDrupalCommerceEvent(){
                registerEvent('change-entities', function(e, elm){
                    var is_config_sdc_manufacturer = $('#section-sdc-manufacturer', container).length > 0;
                    var is_config_sdc_category = $('#section-sdc-category', container).length > 0;
                    var is_config_sdc_product = $('#section-sdc-product', container).length > 0;
                    if(is_config_sdc_manufacturer || is_config_sdc_category || is_config_sdc_product){
                        $('#entity-section .entity-input-type', container).each(function(){
                            var input = $(this);
                            var input_entity = input.data('entity');
                            var is_checked = input.is(':checked');
                            if(input_entity == 'manufacturers'){
                                if(is_checked){
                                    $('#section-sdc-manufacturer', container).css({display: 'block'});
                                    activeValidateExtra($('#section-sdc-manufacturer-type', container));
                                } else {
                                    $('#section-sdc-manufacturer', container).css({display: 'none'});
                                    deactivateValidateExtra($('#section-sdc-manufacturer-type', container));
                                }
                            }
                            if(input_entity == 'categories'){
                                if(is_checked){
                                    $('#section-sdc-category', container).css({display: 'block'});
                                    activeValidateExtra($('#section-sdc-category-type', container));
                                } else {
                                    $('#section-sdc-category', container).css({display: 'none'});
                                    deactivateValidateExtra($('#section-sdc-category-type', container));
                                }
                            }
                            if(input_entity == 'products'){
                                if(is_checked){
                                    $('#section-sdc-product', container).css({display: 'block'});
                                } else {
                                    $('#section-sdc-product', container).css({display: 'none'});
                                }
                            }
                        });
                    }

                    var is_config_tdc_manufacturer = $('#section-tdc-manufacturer', container).length > 0;
                    var is_config_tdc_category = $('#section-tdc-category', container).length > 0;
                    var is_config_tdc_product = $('#section-tdc-product', container).length > 0;
                    if(is_config_tdc_manufacturer || is_config_tdc_category || is_config_tdc_product){
                        $('#entity-section .entity-input-type', container).each(function(){
                            var input = $(this);
                            var input_entity = input.data('entity');
                            var is_checked = input.is(':checked');
                            if(input_entity == 'manufacturers'){
                                if(is_checked){
                                    $('#section-tdc-manufacturer', container).css({display: 'block'});
                                    activeValidateExtra($('#section-tdc-manufacturer-type', container));
                                    activeValidateExtra($('#section-tdc-manufacturer .tdc-manufacturer-map', container));
                                } else {
                                    $('#section-tdc-manufacturer', container).css({display: 'none'});
                                    deactivateValidateExtra($('#section-tdc-manufacturer-type', container));
                                    deactivateValidateExtra($('#section-tdc-manufacturer .tdc-manufacturer-map', container));
                                }
                            }
                            if(input_entity == 'categories'){
                                if(is_checked){
                                    $('#section-tdc-category', container).css({display: 'block'});
                                    activeValidateExtra($('#section-tdc-category-type', container));
                                    activeValidateExtra($('#section-tdc-category .tdc-category-map', container));
                                } else {
                                    $('#section-tdc-category', container).css({display: 'none'});
                                    deactivateValidateExtra($('#section-tdc-category-type', container));
                                    deactivateValidateExtra($('#section-tdc-category .tdc-category-map', container));
                                }
                            }
                            if(input_entity == 'products'){
                                if(is_checked){
                                    $('#section-tdc-product', container).css({display: 'block'});
                                    activeValidateExtra($('#section-tdc-product .tdc-product-map', container));
                                } else {
                                    $('#section-tdc-product', container).css({display: 'none'});
                                    deactivateValidateExtra($('#section-tdc-product .tdc-product-map', container));
                                }
                            }
                        });
                    }
                });

                $(container).on('change', '#sdc-manufacturer-types', function(){
                    var entityType = $(this).val();
                    $('#section-sdc-manufacturer .sdc-manufacturer-map', container).css({display: 'none'});
                    if(entityType != null){
                        entityType.forEach(function(entity_type){
                            $('#sdc-manufacturer-' + entity_type, container).css({display: 'block'});
                        });
                    }
                });

                $(container).on('change', '#sdc-category-types', function(){
                    var categoryType = $(this).val();
                    $('#section-sdc-category .sdc-category-map', container).css({display: 'none'});
                    if(categoryType != null){
                        categoryType.forEach(function(category_type){
                            $('#sdc-category-' + category_type, container).css({display: 'block'});
                        });
                    }
                });

                $(container).on('change', '#tdc-manufacturer-types', function(){
                    var entityType = $(this).val();
                    $('#section-tdc-manufacturer .tdc-manufacturer-map', container).css({display: 'none'});
                    if(entityType != null){
                        entityType.forEach(function(entity_type){
                            $('#tdc-manufacturer-' + entity_type, container).css({display: 'block'});
                        });
                    }
                });

                $(container).on('change', '#tdc-category-types', function(){
                    var categoryType = $(this).val();
                    $('#section-tdc-category .tdc-category-map', container).css({display: 'none'});
                    if(categoryType != null){
                        categoryType.forEach(function(category_type){
                            $('#tdc-category-' + category_type, container).css({display: 'block'});
                        });
                    }
                });
            }

            function triggerEvent(event_name, data){
                $(container).trigger(event_name, data);
            }

            function registerEvent(event_name, callback){
                $(container).on(event_name, callback);
            }

            function registerEvents(){
                registerDrupalCommerceEvent();
            }

            function validateExtraSection(){
                if($('.section-validate-extra', container).length < 1){
                    return true;
                }
                var resultAll = true;
                $('.section-validate-extra.section-validate-required', container).each(function(i, v){
                    var section = $(this);
                    var result = true;
                    $('select', section).each(function(index, value) {
                        var select = $(this);
                        if(select.hasClass('ignore-required')){
                            return;
                        }
                        var elm_val = $(value).val();
                        if(!elm_val){
                            result = false;
                            return false;
                        }
                    });
                    if(!result){
                        resultAll = false;
                        $('.message-valid', section).html('The mapping is required. Please select the missing mapping!').show();
                        scrollToErrorMessage(section);
                    }
                });
                if(!resultAll){
                    return resultAll;
                }
                $('.section-validate-extra.section-validate-duplicate', container).each(function(i, v){
                    var section = $(this);
                    var check = new Array();
                    $('select', section).each(function(index, value) {
                        var elm_val = $(value).val();
                        var elm_opt = $(value).find(':selected');
                        var duplicate = elm_opt.data('ignore-duplicate');
                        if(duplicate == undefined || !duplicate){
                            duplicate = 0;
                        }
                        if(elm_val && duplicate == 0){
                            check[index] = elm_val;
                        }
                    });
                    var result = true;
                    check.forEach(function(value, index) {
                        check.forEach(function(value_tmp, index_tmp) {
                            if (value_tmp === value && index !== index_tmp) {
                                result = false;
                            }
                        });
                    });
                    if(!result){
                        $('.message-valid', section).html('Mapping value can\'t not be the same. Please change!').show();
                        scrollToErrorMessage(section);
                        resultAll = false;
                    }
                });
                return resultAll;
            }

            function run(){

                deleteCookie();

                $(window).on('beforeunload', function () {
                    var check = checkCookie();
                    if (check === true) {
                        return "Migration is in progress, leaving current page will stop it! Are you sure want to stop?";
                    }
                });

                $('.select2', container).select2({width: '100%'});

                $('.platform-select2', container).select2({
                    width: '100%',
                    templateResult: platformSelectTemplateResult,
                    templateSelection: platformSelectTemplateSelection,
                    theme: 'default platform-select2-container'
                });

                $('.action-submit', container).click(function(){
                    var _this = $(this);
                    var form = _this.closest('form');
                    form.submit();
                });

                $(container).on('click', '.box-header.box-collapse', function(){
                    var _this = $(this);
                    var wrap = _this.parents('.wrap-box');
                    wrap.find('.box-content').slideToggle();
                });

                $(container).on('mouseenter', '#upload-wrap .icon-help', function(){
                    var _this = $(this);
                    _this.closest('.form-group').find('.upload-note').slideDown();
                });

                $(container).on('mouseout', '#upload-wrap .icon-help', function(){
                    var _this = $(this);
                    _this.closest('.form-group').find('.upload-note').slideUp();
                });

                $(container).on('click', '#resume-wrap .next-action', function(){
                    showLoading();
                    var form = $('#resume-form');
                    var data = objectifyForm(form, {process: 'resume'});
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            showBox(response.wrap, response.html);
                            activeMenu('step4');
                            setTimeout(function(){
                                var resume_type = $('#resume-form #resume-type').val();
                                importEntity(resume_type);
                            }, 1000);
                        } else {
                            if(response.message){
                                showAlert(response.message);
                            }
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage());
                    });
                });

                $(container).on('change', '.platform_type', function(){
                    showLoading();
                    var _this = $(this);
                    var type = _this.data('type');
                    var name = _this.val();
                    var request_post = getRequestPost();
                    var data = $.extend({
                        process: 'change',
                        name: name,
                        type: type
                    }, request_post);
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            $(response.wrap).html(response.html);
                            $('.select2', response.wrap).select2({width: '100%'});
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage())
                    });
                });

                $(container).on('click', '#setup-wrap .next-action', function(){
                    showLoading();
                    var form = $('#setup-form');
                    resetFormValidate(form);
                    var rules = getFormValidateRule(form);
                    form.validate({
                        rules: rules,
                        errorClass: "message-valid"
                    });
                    var validate = form.valid();
                    if(!validate){
                        hideLoading();
                        return false;
                    }
                    var data = objectifyForm(form, {process: 'setup'});
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            showBox(response.wrap, response.html);
                            if(response.wrap == 'config'){
                                activeMenu('step2');
                            }
                        } else if(response.status == 'error'){
                            if(response.message){
                                showAlert(response.message);
                            }
                            if(response.data){
                                $.each(response.data, function(item){
                                    showFormValidate(this.elementId, this.message, this.type);
                                });
                            }
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage());
                    });
                });

                $(container).on('click', '#upload-wrap .back-action', function(){
                    showBox('setup');
                    activeMenu('step1');
                });

                $(container).on('click', '#upload-wrap .next-action', function(){
                    showLoading();
                    var request_post = getRequestPost();
                    var data = $.extend({process: 'upload'}, request_post);
                    $('#upload-form').ajaxSubmit({
                        url: settings.url,
                        dataType: 'json',
                        beforeSubmit: function (formData, formObject, formOptions) {
                            for(var key in data) {
                                formData.push({name: key, value: data[key]});
                            }
                        },
                        success: function(response, textStatus, errorThrown) {
                            hideLoading();
                            if(response.status == 'success'){
                                showBox(response.wrap, response.html);
                                showBoxAction('storage', 'back');
                                storageData();
                            } else {
                                if(response.message){
                                    showAlert(response.message);
                                }
                                $.each(response.data, function(item){
                                    var elementId = this.elementId;
                                    var html = this.html;
                                    $(elementId).html(html);
                                });
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            hideLoading();
                            showAlert(getRetryMessage());
                        }
                    });
                });

                $(container).on('click', '#storage-wrap .back-action', function(){
                    showBox('setup');
                    activeMenu('step1');
                });

                $(container).on('click', '#storage-wrap .retry-action', function(){
                    hiddenBoxAction('storage', 'retry');
                    storageData();
                });

                $(container).on('click', '#storage-wrap .next-action', function(){
                    showLoading();
                    var form = $('#storage-form');
                    var data = objectifyForm(form, {process: 'storage'});
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            showBox(response.wrap, response.html);
                            activeMenu('step2');
                        } else {
                            if(response.message){
                                showAlert(response.message);
                            }
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage());
                    });
                });

                $(container).on('click', '#config-wrap .back-action', function(){
                    showBox('setup');
                    activeMenu('step1');
                });

                $(container).on('click', '#config-wrap #entity-section input.entity-input-type', function(){
                    var _this = $(this);
                    var check = _this.is(':checked');
                    if(check){
                        _this.parents('li').each(function(index, elm){
                            $(elm).children('div').find('input.entity-input-type').prop('checked', true);
                        });
                    } else {
                        var current = _this.closest('li');
                        current.find('ul input.entity-input-type').prop('checked', false);
                    }
                    triggerEvent('change-entities', this);
                });

                $(container).on('click', '#config-wrap #entity-section #entity-input-all', function(){
                    var _this = $(this);
                    var check = _this.is(':checked');
                    if(check){
                        _this.closest('#entity-section').find('input.entity-input-type').prop('checked', true);
                    } else {
                        var current = _this.closest('#entity-section');
                        current.find('ul input.entity-input-type').prop('checked', false);
                    }
                    triggerEvent('change-entities', this);
                });

                $(container).on('click', '#config-wrap .retry-action', function(){
                    showLoading();
                    var data = {process: 'refresh', type: 'config'};
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            showBox(response.wrap, response.html);
                            activeMenu('step2');
                        } else {
                            if(response.message){
                                showAlert(response.message);
                            }
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage());
                    });
                });

                $(container).on('click', '#config-wrap .next-action', function(){
                    showLoading();
                    resetValidate('#config-wrap');
                    if(!validateSelectRequired('#website-section')
                        || !validateSelectRequired('#language-section')
                        || validateSelectDuplicate('#language-section')
                        || !validateCheckRequired('#entity-section')
                        || validateSelectsDuplicate('.cf-section-entity-map')
                        || validateCustomFieldMapType()
                        || !validateExtraSection()){
                        hideLoading();
                        return false;
                    }
                    var form = $('#config-form');
                    var data = objectifyForm(form, {process: 'config'});
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            showBox(response.wrap, response.html);
                            activeMenu('step3');
                        } else {
                            if(response.message){
                                showAlert(response.message);
                            }
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage());
                    });
                });

                $(container).on('click', '#cf-section .cf-add-field', function(){
                    var _this = $(this);
                    var cf_section = _this.closest('.cf-section-entity');
                    var clone = $('.cf-clone', cf_section);
                    var content_table = $('.mapping-table', cf_section);
                    var html = $(clone.html());
                    var index = cf_section.data('fieldIndex');
                    var entity = cf_section.data('entity');
                    html.find('.cf_source').attr('name', 'cf_source_' + entity + '[' + index + ']');
                    html.find('.cf_target').attr('name', 'cf_target_' + entity + '[' + index + ']');
                    content_table.append(html);
                    index = index + 1;
                    cf_section.data('fieldIndex', index);
                    styleTable(content_table);
                    $('select', html).select2({width: '100%'});
                });

                $(container).on('click', '#cf-section .remove-field', function(){
                    var _this = $(this);
                    var form = _this.closest('.form-group');
                    var cf_section = _this.closest('.cf-section-entity');
                    form.remove();
                    var content_table = $('.mapping-table', cf_section);
                    styleTable(content_table);
                });

                $(container).on('change', '#seo-plugin-select', function(){
                    var _this = $(this);
                    var seo_value = _this.val();
                    if(!seo_value){
                        return false;
                    }
                    var seoPlugin = seo_value.split('|##|');
                    $(container).find('.seo-config-section').css({display: 'none'});
                    seoPlugin.forEach(function(v, i){
                        $(container).find('#' + v).css({display: 'block'});
                    });
                });

                $(container).on('click', '.toggle-element', function(){
                    var _this = $(this);
                    var check = _this.is(':checked');
                    var toggle = _this.data('toggle');
                    if(check){
                        $(toggle).slideDown();
                    } else {
                        $(toggle).slideUp();
                    }
                });

                $(container).on('click', '#confirm-wrap .back-action', function(){
                    showBox('config');
                    activeMenu('step2');
                });

                $(container).on('click', '#confirm-wrap .next-action', function(){
                    showLoading();
                    var form = $('#confirm-form');
                    var data = objectifyForm(form, {process: 'confirm'});
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.status == 'success'){
                            showBox(response.wrap, response.html);
                            activeMenu('step4');
                            setTimeout(function(){
                                prepareImport();
                            }, 1000);
                        } else {
                            if(response.message){
                                showAlert(response.message);
                            }
                        }
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        showAlert(getRetryMessage());
                    });
                });

                $(container).on('click', '#import-wrap .back-action', function(){
                    showBox('confirm');
                    activeMenu('step3');
                });

                $(container).on('click', '#import-wrap .box-action .retry-action', function(){
                    hiddenBoxAction('import', 'retry');
                    prepareImport();
                });

                $(container).on('click', '#clear-process .retry-action', function(){
                    var wrap = $('#clear-process', container);
                    wrap.find('.processing-wrap').show();
                    wrap.find('.success-wrap').hide();
                    wrap.find('.result-action').hide();
                    clearData();
                });

                $(container).on('click', '#import-wrap .entity-process .retry-action', function(){
                    var wrap = $(this).parents('.entity-process');
                    var type = wrap.data('entity');
                    wrap.find('.retry-group').hide();
                    importEntity(type);
                });

                $(container).on('click', '#import-wrap .next-action', function(){
                    showLoading();
                    var data = {process: 'finish'};
                    callProcess(settings.url, data).done(function(response){
                        hideLoading();
                        if(response.message){
                            consoleMessage('#import-wrap .console-box', response.message);
                        }
                        hiddenBoxAction('import', 'next');
                    }).fail(function(xhr, status, error){
                        hideLoading();
                        consoleMessage('#import-wrap .console-box', getRetryMessage());
                        hiddenBoxAction('import', 'next');
                    });
                });

                $(container).on('click', '.download-gateway-direct', function(){
                    var wrap = $(this).closest('.platform-type-info');
                    var token_input = wrap.find('input.platform-connector-token');
                    var token = token_input.val();
                    if(!token){
                        token = genToken();
                    }
                    token_input.val(token);
                    var request_download = getRequestDownload();
                    var data = $.extend({
                        mg_token: token
                    }, request_download);
                    var form = $('#gateway-download-form');
                    form.attr('action', settings.url);
                    $.each(data, function(index, value) {
                        $('<input>').attr({
                            type: 'hidden',
                            id: index,
                            name: index,
                            value: value
                        }).appendTo(form);
                    });
                    form.submit();
                });

                $(container).on('click', '.download-gateway', function(){
                    var wrap = $(this).closest('.platform-type-info');
                    var token_input = wrap.find('input.platform-connector-token');
                    var token = token_input.val();
                    if(!token){
                        token = genToken();
                    }
                    token_input.val(token);
                    var request = new XMLHttpRequest();
                    request.open('POST', settings.url, true);
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    request.responseType = 'blob';
                    request.onload = function() {
                        if (request.status === 200) {
                            var disposition = request.getResponseHeader('content-disposition');
                            var type = request.getResponseHeader('Content-Type');
                            var matches = /"([^"]*)"/.exec(disposition);
                            var filename = (matches != null && matches[1] ? matches[1] : 'migration_gateway.zip');
                            var blob = new Blob([request.response], {type: type});
                            var link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                    };
                    var request_download = getRequestDownload();
                    var data = $.extend({
                        mg_token: token
                    }, request_download);
                    var params = buildQuery(data);
                    request.send(params);
                });

                $(container).on('click', '.check-gateway', function(){
                    var type = $(this).data('type');
                    if(!type){
                        return false;
                    }
                    var id = '#' + type + '-url';
                    var url = $(id).val();
                    if(!url){
                        return false;
                    }
                    url += '/migration_gateway/gateway.php';
                    window.open(url, '_blank');
                });

                registerEvents();

            }

            return run();
        }
    });
}));
