$(function() {
    var gAllPrioritiesData;
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
        var template2 = $('#appTemplate');
        var newRow = template2.clone().removeAttr("hidden id");
        newRow.insertAfter(tr);
        refreshAppTableNumber(table);
    };

    var addRowToTable = function(table) {
        var template2 = $('#appTemplate');
        var newRow = template2.clone().removeAttr("hidden id");
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
        var total = table.rows.length-2;
        for(var i=0;i< total;i++) {
            table.deleteRow(0);
        }
    };

    var addPriority = function(priority, type, result) {
        clearPriorityList();
        var template1 = $('#priorityTemplate1');
        var template2 = $('#priorityTemplate2');
        var tr1 = template1.clone().removeAttr("hidden id");
        var tr2 = template2.clone().removeAttr("hidden id");
        tr1.insertBefore(template1);
        tr2.insertBefore(template1);
        var priorityTable = document.getElementById("priorityList");
        // console.log(table);
        var rows = priorityTable.rows;
        var appTable = rows[rows.length-3].childNodes[1].childNodes[1];
        if (priority) {
            var featureTable = rows[rows.length-4].childNodes[1].childNodes[1];
            fillFeatureTable(featureTable, priority, type, result);
            fillAppTable(appTable, result);
        } else {
            addRowToTable(appTable);
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
        var secondRow = featureTable.rows[2];
        var thirdRow = featureTable.rows[3];
        var fourthRow = featureTable.rows[4];
        var fifthRow = featureTable.rows[5];
        var seventhRow = featureTable.rows[7];
        console.log(typeof result);
        var obj = JSON.parse(result);
        // var obj = eval ("(" + result + ")"); // 这个也可以转换, 但上面的更友好
        $(firstRow).find('[name="priority"]').val(priority);
        $(firstRow).find('[name="type"]').val(type);
        $(firstRow).find('[name="hide_mode"]').prop('checked', obj.hide_mode);
        $(firstRow).find('[name="idle_mode"]').prop('checked', obj.idle_mode);
        $(firstRow).find('[name="miui_idle"]').prop('checked', obj.miui_idle);
        $(firstRow).find('[name="miui_standby"]').prop('checked', obj.miui_standby);
        $(firstRow).find('[name="ble_scan_block"]').prop('checked', obj.ble_scan_block);
        $(firstRow).find('[name="frozen"]').prop('checked', obj.frozen);
        $(secondRow).find('[name="no_core_system_apps"]').val(obj.no_core_system_apps);
        $(thirdRow).find('[name="music_apps"]').val(obj.music_apps);
        $(fourthRow).find('[name="level_ultimate_special_apps"]').val(obj.level_ultimate_special_apps);
        $(fifthRow).find('[name="ble_scan_param"]').val(obj.ble_scan_param);
        $(seventhRow).find('[name="hot_feedback"]').prop('checked', obj.hot_feedback);
        $(seventhRow).find('[name="network_feedback"]').prop('checked', obj.network_feedback);
        $(seventhRow).find('[name="location_delay_hot"]').val(obj.location_delay_hot);
        $(seventhRow).find('[name="kill_delay_hot"]').val(obj.kill_delay_hot);
        var featureList = obj.feature_list;
        featureList.forEach(function(item){
            var key = '[name="'+item.action_key+'"]';
            var value = item.action_value;
            if (item.action_key == 'set_data_connection' || item.action_key == 'set_location' || item.action_key == 'set_sensor') {
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
            var newRow = addRowToTable(appTable);
            $(newRow).find('[name="app_name"]').val(item.app_name);
            if (item.remark)
                $(newRow).find('[name="remark"]').val(item.remark);
            $(newRow).find('[name="added"]').prop('checked', item.added);
            var actionList = item.action_list;
            actionList.forEach(function(action){
                var key = '[name="' + action.action_key + '"]';
                var value = action.action_value;
                if (action.action_key == 'set_data_connection' || action.action_key == 'set_location' || action.action_key == 'set_sensor') {
                    $(newRow).find(key).prop('checked', value);
                } else {
                    $(newRow).find(key).val(value);
                }
            });
        });
        if (appList.length < 1) {addRowToTable(appTable);}
    };



    var action2Json = function(key, value) {
        var json = {"action_key":key, "action_value":value};
        return json;
    };

    var appRow2Json = function(app, added, groupId, data, gps, delay, gps_delay, sensor_delay, kill_delay, delay_count, data_kb, inactive_count, location_delay_hot, kill_delay_hot) {
        var actionList = [];
        var index = 0;
        actionList[index++] = action2Json("set_data_connection", data);
        actionList[index++] = action2Json("set_location", gps);
        if (delay) {
            actionList[index++] = action2Json("app_delay", delay);
        }
        if (gps_delay) {
            actionList[index++] = action2Json("set_location_delay", gps_delay);
        }
        if (sensor_delay) {
            actionList[index++] = action2Json("sensor_delay", sensor_delay);
        }
        if (kill_delay) {
            actionList[index++] = action2Json("kill_delay", kill_delay);
        }
        if (delay_count) {
            actionList[index++] = action2Json("set_delay_count", delay_count);
        }
        if (data_kb) {
            actionList[index++] = action2Json("set_data_kb", data_kb);
        }
        if (inactive_count) {
            actionList[index++] = action2Json("set_inactive_count", inactive_count);
        }
        if (location_delay_hot) {
            actionList[index++] = action2Json("location_delay_hot", location_delay_hot);
        }
        if (kill_delay_hot) {
            actionList[index++] = action2Json("kill_delay_hot", kill_delay_hot);
        }
        var json = {"app_name":app, "added":added, "group_id":5, "action_list":actionList};

        return json;
    }

    var feature2Json = function(key, value) {
        var json = {"group_id":5, "added":"true", "action_key":key, "action_value":value};
        return json;
    }

    var featureList2Json = function(data, gps, sensor, delay, gps_delay, sensor_delay, kill_delay, delay_count, data_kb, inactive_count) {
        var featureList = [];
        var index = 0;
        featureList[index++] = feature2Json("set_data_connection", data);
        featureList[index++] = feature2Json("set_location", gps);
        featureList[index++] = feature2Json("set_sensor", sensor);
        if (delay) {
            featureList[index++] = feature2Json("app_delay", delay);
        }
        if (gps_delay) {
            featureList[index++] = feature2Json("set_location_delay", gps_delay);
        }
        if (sensor_delay) {
            featureList[index++] = feature2Json("sensor_delay", sensor_delay);
        }
        if (kill_delay) {
            featureList[index++] = feature2Json("kill_delay", kill_delay);
        }
        if (delay_count) {
            featureList[index++] = feature2Json("set_delay_count", delay_count);
        }
        if (data_kb) {
            featureList[index++] = feature2Json("set_data_kb", data_kb);
        }
        if (inactive_count) {
            featureList[index++] = feature2Json("set_inactive_count", inactive_count);
        }
        return featureList;
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

        for(var i=0;i< rows.length-1;i+=2) {
            var result;
            var priority = $(rows[i]).find('input[name="priority"]').val();
            var type = $(rows[i]).find('input[name="type"]').val();
            var no_core_system_apps = $(rows[i]).find('input[name="no_core_system_apps"]').val();
            var music_apps = $(rows[i]).find('input[name="music_apps"]').val();
            var level_ultimate_special_apps = $(rows[i]).find('input[name="level_ultimate_special_apps"]').val();
            var ble_scan_param = $(rows[i]).find('input[name="ble_scan_param"]').val();
            try {
                var reg = new RegExp(type);
                console.log(reg);
            } catch (err) {
                alert('type:' + type + '\nerror:' + err);
                console.log(err);
                return false;
            }
            var hide_mode = $(rows[i]).find('input[name="hide_mode"]').prop('checked');
            if (!priority || !type) {continue;}
            var idle_mode = $(rows[i]).find('input[name="idle_mode"]').prop('checked');
            var miui_idle = $(rows[i]).find('input[name="miui_idle"]').prop('checked');
            var miui_standby = $(rows[i]).find('input[name="miui_standby"]').prop('checked');
            var data = $(rows[i]).find('input[name="set_data_connection"]').prop('checked');
            var gps = $(rows[i]).find('input[name="set_location"]').prop('checked');
            var ble_scan_block = $(rows[i]).find('input[name="ble_scan_block"]').prop('checked');
            var hot_feedback = $(rows[i]).find('input[name="hot_feedback"]').prop('checked');
            var network_feedback = $(rows[i]).find('input[name="network_feedback"]').prop('checked');
            var frozen = $(rows[i]).find('input[name="frozen"]').prop('checked');
            var sensor = $(rows[i]).find('input[name="set_sensor"]').prop('checked');
            var delay = $(rows[i]).find('input[name="app_delay"]').val();
            var gps_delay = $(rows[i]).find('input[name="set_location_delay"]').val();
            var sensor_delay = $(rows[i]).find('input[name="sensor_delay"]').val();
            var kill_delay = $(rows[i]).find('input[name="kill_delay"]').val();
            var delay_count = $(rows[i]).find('input[name="set_delay_count"]').val();
            var data_kb = $(rows[i]).find('input[name="set_data_kb"]').val();
            var inactive_count = $(rows[i]).find('input[name="set_inactive_count"]').val();
            var location_delay_hot = $(rows[i]).find('input[name="location_delay_hot"]').val();
            var kill_delay_hot = $(rows[i]).find('input[name="kill_delay_hot"]').val();
            var featureList = featureList2Json(data, gps, sensor, delay, gps_delay, sensor_delay, kill_delay, delay_count, data_kb, inactive_count);
            var appTable = rows[i+1].childNodes[1].childNodes[1];
            var appRows = appTable.rows;
            var appList = [];
            var index = 0;
            for(var j=2;j < appRows.length;j++) {
                var app_name = $(appRows[j]).find('input[name="app_name"]').val();
                var added = $(appRows[j]).find('input[name="added"]').prop('checked');
                if (!app_name) { continue; }
                var groupId = 5;
                var data = $(appRows[j]).find('input[name="set_data_connection"]').prop('checked');
                var gps = $(appRows[j]).find('input[name="set_location"]').prop('checked');
                var delay = $(appRows[j]).find('input[name="app_delay"]').val();
                var gps_delay = $(appRows[j]).find('input[name="set_location_delay"]').val();
                var sensor_delay = $(appRows[j]).find('input[name="sensor_delay"]').val();
                var app_kill_delay = $(appRows[j]).find('input[name="kill_delay"]').val();
                var delay_count = $(appRows[j]).find('input[name="set_delay_count"]').val();
                var data_kb = $(appRows[j]).find('input[name="set_data_kb"]').val();
                var inactive_count = $(appRows[j]).find('input[name="set_inactive_count"]').val();
                var app_location_delay_hot = $(appRows[j]).find('input[name="location_delay_hot"]').val();
                var app_kill_delay_hot = $(appRows[j]).find('input[name="kill_delay_hot"]').val();
                var app = appRow2Json(app_name, added, groupId, data, gps, delay, gps_delay, sensor_delay, app_kill_delay, delay_count, data_kb, inactive_count, app_location_delay_hot, app_kill_delay_hot);
                appList[index++] = app;
            }
            result = {"feature_list":featureList, "app_list":appList};
            result["hide_mode"] = hide_mode;
            result["idle_mode"] = idle_mode;
            result["miui_idle"] = miui_idle;
            result["miui_standby"] = miui_standby;
            result["no_core_system_apps"] = no_core_system_apps;
            result["music_apps"] = music_apps;
            result["level_ultimate_special_apps"] = level_ultimate_special_apps;
            result["ble_scan_block"] = ble_scan_block;
            result["hot_feedback"] = hot_feedback;
            result["network_feedback"] = network_feedback;
            result["location_delay_hot"] = location_delay_hot;
            result["kill_delay_hot"] = kill_delay_hot;
            result["ble_scan_param"] = ble_scan_param;
            result["frozen"] = frozen;
            result = JSON.stringify(result);
            dataArray[count] = {"priority":priority, "type":type, "result":result, pushStrategy: 'ALL'};
            md5Array[count] = {"priority":priority, "type":type, "result":getMD5(result), pushStrategy: 'ALL'};
            count++;
        }
        outArray[0] = dataArray;
        outArray[1] = md5Array;
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
        var filename = 'power_config.json';
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
            if (value == 'power') {
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
        // getServerConfig();
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

   var postData = function(url, data, flash, msg) {
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
                    alert(msg);
                    if (flash) refresh();
                }
            }
        });
   };

    var submit = function() {
        var region = $('#regionSelect').val();
        var bucket = JSON.parse($('#bucketSelect').val());
        var type = bucket.type.match(/Base(\w+)/)[1].toLowerCase();
        var url = 'regions/' + region + '/buckets/' + bucket.bucket + '/fileProfiles'
        var md5Url =  'config/' + type + '/' + region + '/' + 'md5';
        var data = getAllPrioritiesData();
        console.log(JSON.stringify(data, null, 4));
        if (data) {
            postData(md5Url, {norm: data[1]}, false, "md5提交成功");
            postData(url, {norm: data[0]}, true, "数据提交成功");
            return true;
        } else {
            alert('数据解析失败!');
            return false;
        }
    }

    var refresh = function() {
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

