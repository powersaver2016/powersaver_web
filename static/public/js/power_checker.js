$(function() {
    var gAllPrioritiesData;
    var gCheckBoxKeyMap = {};
    var gAddPriority = false;
    var deleteRow = function(btn) {
        console.log(btn);
        var tr = btn.parentNode.parentNode;
        var table = tr.parentNode.parentNode;
        var i=tr.rowIndex;
        console.log(table.rows.length);
        if (table.rows.length < 4) {
            alert("当前行不能删除...");
        } else {
            table.deleteRow(i);
        }
        refreshAppTableNumber(table);
    };

    var addRow = function(row) {
        var tr = row.parentNode.parentNode;
        var table = tr.parentNode.parentNode;
        var template2 = $('#appRowTemplate');
        var newRow = template2.clone().removeAttr("hidden id");
        newRow.insertAfter(tr);
        refreshAppTableNumber(table);
    };

    var addRowToAppTable = function(table) {
        var appRowTemplate = $('#appRowTemplate');
        var newRow = appRowTemplate.clone().removeAttr("hidden id");
        newRow.appendTo(table);
        refreshAppTableNumber(table);
        return newRow;
    };

    var deletePriority = function(row) {
        if (!confirm("确定删除?")) {
            return false;
        }
        var td = row.parentNode.parentNode.parentNode.parentNode;
        var tr = td.parentNode.parentNode;
        var table = tr.parentNode.parentNode;
        var i=tr.rowIndex;
        var priority = $(tr).find('[name="priority"]').val();
        if (!priority) {
            table.deleteRow(i);
            // 删除后,索引要更新的
            table.deleteRow(i);
            return false;
        }
        var region = $('#regionSelect').val();
        var bucket = JSON.parse($('#bucketSelect').val());
        var bucketType = bucket.type.match(/Base(\w+)/)[1].toLowerCase();
        var url = 'config/' + bucketType + '/' + region + '/' + bucket.bucket + '/' + priority;
        $.ajax({
            type: 'DELETE',
            url: url,
            error: function(xhr) {
                alert(xhr.status);
            },
            success: function() {
                table.deleteRow(i);
                // 删除后,索引要更新的
                table.deleteRow(i);
                if (table.rows.length < 3) {
                    addPriority(1);
                }
            }
        });
        return true;
    };

    var refreshAppTableNumber = function(appTable) {
        var appRows = appTable.rows;
        var index = 1;
        for(var j=2;j < appRows.length;j++) {
            $(appRows[j]).find('[name="number"]').val(index++);
        }
    };

    var clearPriorityList = function() {
        var table = document.getElementById("priorityList");
        // 模板不能删除
        var total = table.rows.length-2;
        for(var i=0;i< total;i++) {
            table.deleteRow(0);
        }
    };

    var addPriority = function(priority, type, result) {
        clearPriorityList();
        var featureTemplate = $('#featureTemplate');
        var appTableTemplate = $('#appTableTemplate');
        var tr1 = featureTemplate.clone().removeAttr("hidden id");
        var tr2 = appTableTemplate.clone().removeAttr("hidden id");
        tr1.insertBefore(featureTemplate);
        tr2.insertBefore(featureTemplate);
        var priorityTable = document.getElementById("priorityList");
        var rows = priorityTable.rows;
        console.log(rows.length);
        var appTable = rows[rows.length-3].childNodes[1].childNodes[1];
        if (priority) {
            var featureTable = rows[rows.length-4].childNodes[1].childNodes[1];
            fillFeatureTable(featureTable, priority, type, result);
            fillAppTable(appTable, result);
        } else {
            addRowToAppTable(appTable);
        }
        refreshAppTableNumber(appTable);
        return appTable;
    };

    var fillPriorityList = function(jsonArray, priority) {
        jsonArray.forEach(function(obj) {
            if (priority == obj.priority) {
                addPriority(obj.priority, obj.type, obj.result);
            }
        });
    };

    var fillFeatureTable = function(featureTable, priority, type, result) {
        var firstRow = featureTable.rows[1];
        console.log(typeof result);
        var obj = JSON.parse(result);
        // var obj = eval ("(" + result + ")"); // 这个也可以转换, 但上面的更友好
        $(firstRow).find('[name="priority"]').val(priority);
        $(firstRow).find('[name="type"]').val(type);

        var featureList = obj.feature_list;
        featureList.forEach(function(item){
            var key = '[name="'+item.action_key+'"]';
            var value = item.action_value;
            if (gCheckBoxKeyMap[item.action_key]) {
                $(firstRow).find(key).prop('checked', value);
            } else {
                $(firstRow).find(key).val(value);
            }
        });
    };

    var fillAppTable = function(appTable, result) {
        var obj = JSON.parse(result);
        var appList = obj.app_list;
        appList.forEach(function(item){
            var newRow = addRowToAppTable(appTable);
            $(newRow).find('[name="app_name"]').val(item.app_name);
            var actionList = item.action_list;
            actionList.forEach(function(action){
                var key = '[name="' + action.action_key + '"]';
                var value = action.action_value;
                if (gCheckBoxKeyMap[action.action_key]) {
                    $(newRow).find(key).prop('checked', value);
                } else {
                    $(newRow).find(key).val(value);
                }
            });
        });
        if (appList.length < 1) {addRowToAppTable(appTable);}
    };

    var action2Json = function(key, value) {
        var json = {"action_key":key, "action_value":value};
        return json;
    };

    var appRow2Json = function(app_name, cpu_factor, gps_factor, wifi_factor, wakelock_factor, alarm_factor, long_threshold, short_threshold, default_list, default_note, default_kill) {
        var actionList = [];
        var index = 0;
        if (cpu_factor) { actionList[index++] = action2Json("cpu_factor", cpu_factor); }
        if (gps_factor) { actionList[index++] = action2Json("gps_factor", gps_factor); }
        if (wifi_factor) { actionList[index++] = action2Json("wifi_factor", wifi_factor); }
        if (wakelock_factor) { actionList[index++] = action2Json("wakelock_factor", wakelock_factor); }
        if (alarm_factor) { actionList[index++] = action2Json("alarm_factor", alarm_factor); }
        if (long_threshold) { actionList[index++] = action2Json("long_threshold", long_threshold); }
        if (short_threshold) { actionList[index++] = action2Json("short_threshold", short_threshold); }
        actionList[index++] = action2Json("default_list", default_list);
        actionList[index++] = action2Json("default_note", default_note);
        actionList[index++] = action2Json("default_kill", default_kill);

        var json = {"app_name":app_name, "action_list":actionList};
        return json;
    }

    var featureList2Json = function(checker_mode, global_list, long_term_note, short_term_note, long_term_day, long_term_num,
                                                               cpu_factor, gps_factor, wifi_factor, wakelock_factor, alarm_factor, long_threshold, short_threshold, default_list, default_note, default_kill) {
        var actionList = [];
        var index = 0;
        actionList[index++] = action2Json("checker_mode", checker_mode);
        actionList[index++] = action2Json("global_list", global_list);
        actionList[index++] = action2Json("short_term_note", short_term_note);
        actionList[index++] = action2Json("long_term_note", long_term_note);
        if (long_term_day) { actionList[index++] = action2Json("long_term_day", long_term_day); }
        if (long_term_num) { actionList[index++] = action2Json("long_term_num", long_term_num); }

        if (cpu_factor) { actionList[index++] = action2Json("cpu_factor", cpu_factor); }
        if (gps_factor) { actionList[index++] = action2Json("gps_factor", gps_factor); }
        if (wifi_factor) { actionList[index++] = action2Json("wifi_factor", wifi_factor); }
        if (wakelock_factor) { actionList[index++] = action2Json("wakelock_factor", wakelock_factor); }
        if (alarm_factor) { actionList[index++] = action2Json("alarm_factor", alarm_factor); }
        if (long_threshold) { actionList[index++] = action2Json("long_threshold", long_threshold); }
        if (short_threshold) { actionList[index++] = action2Json("short_threshold", short_threshold); }
        actionList[index++] = action2Json("default_list", default_list);
        actionList[index++] = action2Json("default_note", default_note);
        actionList[index++] = action2Json("default_kill", default_kill);

        return actionList;
    }

    var getMD5 = function(json) {
        return md5(json);
    }

    var traversalTable = function() {
        var table = document.getElementById("priorityList");
        var rows = table.rows;
        var dataArray = [];
        var md5Array = [];
        var outArray = [];
        var count = 0;

        for(var i=0;i< rows.length-2;i+=2) {
            var result;
            var priority = $(rows[i]).find('input[name="priority"]').val();
            var type = $(rows[i]).find('input[name="type"]').val();
            if (!priority || !type) {continue;}
            try {
                var reg = new RegExp(type);
                console.log(reg);
            } catch (err) {
                alert('type:' + type + '\nerror:' + err);
                console.log(err);
                return false;
            }

            var checker_mode = $(rows[i]).find('input[name="checker_mode"]').prop('checked');
            var global_list = $(rows[i]).find('input[name="global_list"]').prop('checked');
            var long_term_note = $(rows[i]).find('input[name="long_term_note"]').prop('checked');
            var short_term_note = $(rows[i]).find('input[name="short_term_note"]').prop('checked');
            var long_term_day = $(rows[i]).find('input[name="long_term_day"]').val();
            var long_term_num = $(rows[i]).find('input[name="long_term_num"]').val();
            var cpu_factor = $(rows[i]).find('input[name="cpu_factor"]').val();
            var gps_factor = $(rows[i]).find('input[name="gps_factor"]').val();
            var wifi_factor = $(rows[i]).find('input[name="wifi_factor"]').val();
            var wakelock_factor = $(rows[i]).find('input[name="wakelock_factor"]').val();
            var alarm_factor = $(rows[i]).find('input[name="alarm_factor"]').val();
            var long_threshold = $(rows[i]).find('input[name="long_threshold"]').val();
            var short_threshold = $(rows[i]).find('input[name="short_threshold"]').val();
            var default_list = $(rows[i]).find('input[name="default_list"]').prop('checked');
            var default_note = $(rows[i]).find('input[name="default_note"]').prop('checked');
            var default_kill = $(rows[i]).find('input[name="default_kill"]').prop('checked');
            var featureList = featureList2Json (checker_mode, global_list, long_term_note, short_term_note, long_term_day, long_term_num,
                                                               cpu_factor, gps_factor, wifi_factor, wakelock_factor, alarm_factor, long_threshold, short_threshold, default_list, default_note, default_kill);

            var appTable = rows[i+1].childNodes[1].childNodes[1];
            var appRows = appTable.rows;
            var appList = [];
            var index = 0;
            for(var j=2;j < appRows.length;j++) {
                var app_name = $(appRows[j]).find('input[name="app_name"]').val();
                if (!app_name) { continue; }
                cpu_factor = $(appRows[j]).find('input[name="cpu_factor"]').val();
                gps_factor = $(appRows[j]).find('input[name="gps_factor"]').val();
                wifi_factor = $(appRows[j]).find('input[name="wifi_factor"]').val();
                wakelock_factor = $(appRows[j]).find('input[name="wakelock_factor"]').val();
                alarm_factor = $(appRows[j]).find('input[name="alarm_factor"]').val();
                console.log('alarm_factor:' + alarm_factor);
                long_threshold = $(appRows[j]).find('input[name="long_threshold"]').val();
                short_threshold = $(appRows[j]).find('input[name="short_threshold"]').val();
                default_list = $(appRows[j]).find('input[name="default_list"]').prop('checked');
                default_note = $(appRows[j]).find('input[name="default_note"]').prop('checked');
                default_kill = $(appRows[j]).find('input[name="default_kill"]').prop('checked');
                var app = appRow2Json(app_name, cpu_factor, gps_factor, wifi_factor, wakelock_factor, alarm_factor, long_threshold, short_threshold, default_list, default_note, default_kill);
                appList[index++] = app;
            }

            result = {"feature_list":featureList, "app_list":appList};
            result = JSON.stringify(result);
            dataArray[count] = {"priority":priority, "type":type, "result":result, pushStrategy: 'ALL'};
            md5Array[count] = {"priority":priority, "type":type, "result":getMD5(result), pushStrategy: 'ALL'};
            count++;
        }
        outArray[0] = dataArray;
        outArray[1] = md5Array;
        console.log(JSON.stringify(outArray, null, 4));
        return outArray;
    }

    var readConfigFile = function (files) {
        file = files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                var data = this.result;
                try {
                    var json = JSON.parse(data);
                    // console.log(JSON.stringify(json[0], null, 4));
                    clearPriorityList();
                    parsePrioritys(json[0]);
                    alert("导入成功后并没有提交, 如需保存请全部提交一次!");
                    document.getElementById('files').value = "";
                } catch (error) {
                     alert(error.message);
                     alert("导入文件有误!");
                     popTable();
                }
            };
        })(file);
        reader.readAsText(file);
    }

    $('#priorityList').on('click', '.addPriority', function() {
        console.log("addPriority");
        gAddPriority = true;
        addPriority();
    });

    $('#priorityList').on('click', '.deletePriority', function() {
        console.log("deletePriority");
        deletePriority(this);
    });

    $('#priorityList').on('click', '.addRow', function() {
        console.log("addRow");
        addRow(this);
    });

    $('#priorityList').on('click', '.deleteRow', function() {
        console.log("deleteRow");
        deleteRow(this);
    });

    $('#exportConfigBtn').click(function() {
        var data = JSON.stringify(getAllPrioritiesData(), null, 4);
        var filename = 'power_checker_config.json';
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        pom.setAttribute('download', filename);
        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        } else {
        pom.click();
        }

    });

    $('#importConfigBtn').click(function(event) {
        var files = document.getElementById('files').files;
        console.log(files);
        if (files.length > 0) {
           readConfigFile(files);
        } else {
            alert('请选择配置文本文件');
        }
    });

    var popRegions = function(regions) {
        var select = $('#regionSelect');
        $.each(regions, function(index, value) {
            if (value == 'power_checker') {
                select.append($('<option/>').val(this).text(this));
            }
        });
    };

    var popBuckets = function(region, buckets) {
        var region = region || $('#regionSelect').val();
        var bucketList = buckets[region];
        var select = $('#bucketSelect');
        select.empty();
        $.each(bucketList, function() {
            select.append($('<option/>').val(JSON.stringify(this)).text(this.bucket));
        });
        getServerConfig();
    };

    var parsePrioritys = function(jsonArray) {
        var prioritys = [];
        var index = 0;
        gAllPrioritiesData = jsonArray;
        jsonArray.forEach(function(obj) {
            prioritys[index++] = obj.priority;
        });
        popPrioritys(prioritys);
    }

    var popPrioritys = function(prioritys) {
        var select = $('#prioritySelect');
        select.empty();
        $.each(prioritys, function() {
            select.append($('<option/>').val(this).text(this));
        });
        popTable();
    };

    var getServerConfig = function(region, bucket) {
        region = region || $('#regionSelect').val();
        bucket = bucket || JSON.parse($('#bucketSelect').val());
        if (!bucket) {
            clearPriorityList();
            return;
        }
        var type = bucket.type.match(/Base(\w+)/)[1].toLowerCase();
        var url = '../base/' + type + '/' + region + '/' + bucket.bucket;
        console.log(url);
        $.ajax({
            type: 'GET',
            url: url,
            crossDomain: true,
            dataType: 'json',
            jsonpCallback: 'callback',
            error: function(xhr) {
                console.log('ajax error');
                console.log(xhr);
            },
            success: function(res) {
                console.log(JSON.stringify(res.data, null, 4));
                clearPriorityList();
                if (bucket.bucket == 'md5') {
                    alert(JSON.stringify(res.data, null, 4));
                    $('#submit').attr('disabled',true);
                    return;
                } else {
                    $('#submit').attr('disabled',false);
                }
                gAllPrioritiesData = res.data.norm;
                parsePrioritys(gAllPrioritiesData);
            }
        })
    };

    var getAllPrioritiesData = function() {
        var data = traversalTable();

        var dataArray = [];
        var md5Array = [];
        var outArray = [];
        var priority;

        if (gAllPrioritiesData.length == 0) gAddPriority = true;
        if (gAddPriority) {
            priority = -1;
        } else {
            priority = $('#prioritySelect').val();
        }

        var count = 0;
        gAllPrioritiesData.forEach(function(item) {
            if (item.priority == priority) {
                dataArray[count] = data[0][0];
                md5Array[count] = data[1][0];
            } else {
                dataArray[count] = {"priority":item.priority, "type":item.type, "result":item.result, pushStrategy: 'ALL'};
                md5Array[count] = {"priority":item.priority, "type":item.type, "result":getMD5(item.result), pushStrategy: 'ALL'};
            }
            count++;
        });
        if (gAddPriority) {
            dataArray[count] = data[0][0];
            md5Array[count] = data[1][0];
        }
        outArray[0] = dataArray;
        outArray[1] = md5Array;
        data = outArray;
        gAddPriority = false;
        return data;
    }

    var popTable = function(region, bucket, priority) {
        region = region || $('#regionSelect').val();
        bucket = bucket || JSON.parse($('#bucketSelect').val());
        priority = priority || $('#prioritySelect').val();
        if (!bucket) {
            clearPriorityList();
            return;
        }
        //console.log(JSON.stringify(res.data, null, 4));
        clearPriorityList();
        if (bucket.bucket == 'md5') {
            alert(JSON.stringify(gAllPrioritiesData, null, 4));
            $('#submit').attr('disabled',true);
            return;
        } else {
            $('#submit').attr('disabled',false);
        }
        if (gAllPrioritiesData.length === 0) {
            console.log("gAllPrioritiesData.length == 0");
            addPriority();
        } else {
            fillPriorityList(gAllPrioritiesData, priority);
        }
    };

    $('#regionSelect').on('change', function() {
        var region = $(this).val();
        popBuckets(region, buckets);
    });

    $('#bucketSelect').on('change', function() {
        popTable();
    });

    $('#prioritySelect').on('change', function() {
        popTable();
    });

   var postData = function(url, data, flash) {
        console.log('submit:' + url);
        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(data),
            error: function(xhr) {
                alert(xhr.status);
            },
            success: function(res) {
                if (res.error) alert(res.error);
                else {
                    if (flash) refresh();
                }
            }
        });
   };

    var submit = function() {
        var region = $('#regionSelect').val();
        var bucket = JSON.parse($('#bucketSelect').val());
        var type = bucket.type.match(/Base(\w+)/)[1].toLowerCase();
        var url =  'config/' + type + '/' + region + '/' + bucket.bucket;
        var md5Url =  'config/' + type + '/' + region + '/' + 'md5';
        var data = getAllPrioritiesData();
        console.log('==getAllPrioritiesData==');
        console.log(JSON.stringify(data, null, 4));
        if (data) {
            postData(md5Url, {norm: data[1]}, false);
            postData(url, {norm: data[0]}, true);
            alert('提交成功!');
            return true;
        } else {
            alert('提交失败!');
            return false;
        }
    }

    var refresh = function() {
        gCheckBoxKeyMap['checker_mode'] = 1;
        gCheckBoxKeyMap['global_list'] = 1;
        gCheckBoxKeyMap['long_term_note'] = 1;
        gCheckBoxKeyMap['short_term_note'] = 1;
        gCheckBoxKeyMap['default_list'] = 1;
        gCheckBoxKeyMap['default_note'] = 1;
        gCheckBoxKeyMap['default_kill'] = 1;
        popRegions(regions);
        popBuckets(null, buckets);
    }

    $('#floatingSubmitBtn').on('click', function() {
        submit();
    });

    $('#allSubmitBtn').click(function() {
        submit();
    });

    refresh();
});

