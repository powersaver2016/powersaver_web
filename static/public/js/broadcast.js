$(function() {
var gAllPrioritiesData;
var gAddPriority = false;
var alarmTitle = "0:RTC_WAKEUP, 1:RTC, 2:ELAPSED_REALTIME_WAKEUP, 3:ELAPSED_REALTIME";
var broadcastList = [
        /*0*/"broadcast.restrict.all",  /*broadcast.restrict.all*/
        /*1*/"android.intent.action.SCREEN_ON",
        /*2*/"android.intent.action.SCREEN_OFF",
        /*3*/"android.net.wifi.RSSI_CHANGED",
        /*4*/"android.net.wifi.SCAN_RESULTS",
        /*5*/"android.intent.action.USER_PRESENT",
        /*6*/"android.net.conn.CONNECTIVITY_CHANGE",
        /*7*/"android.intent.action.ACTION_POWER_CONNECTED",
        /*8*/"android.intent.action.ACTION_POWER_DISCONNECTED",
        /*9*/"android.intent.action.PACKAGE_ADDED",
        /*10*/"android.intent.action.PACKAGE_REMOVED",
        /*11*/"android.intent.action.PACKAGE_REPLACED",
        /*12*/"android.provider.Telephony.SMS_RECEIVED",
        /*13*/"android.intent.action.NEW_OUTGOING_CALL",
        /*14*/"android.intent.action.BATTERY_CHANGED",
        /*15*/"android.intent.action.MEDIA_BUTTON",
        /*16*/"android.intent.action.HEADSET_PLUG",
        /*17*/"android.bluetooth.device.action.ACL_DISCONNECTED",
        /*18*/"android.net.wifi.STATE_CHANGE",
        /*19*/"android.net.wifi.WIFI_STATE_CHANGED"
];

var getBroadcastList = function() {
    return broadcastList;
};

var getAlarmTitle = function() {
    return alarmTitle;
};


var fillBroadcastTable = function(general_restricted_bc) {
    var broadcastTable = document.getElementById("broadcastList");
    var index = 0;
    var broadcastList = getBroadcastList();
    broadcastList.forEach(function(item, index){
        var newRow = addRowToBroadcastTable(broadcastTable);
        $(newRow).find('[name="index"]').val(index);
        $(newRow).find('[name="broadcast_name"]').val(item);
    });
};


var deleteRow = function(btn) {
    var tr = btn.parentNode.parentNode;
    var table = tr.parentNode.parentNode;
    var i=tr.rowIndex;

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

var addRowToBroadcastTable = function(table) {
    var template2 = $('#broadcastTemplate');
    var newRow = template2.clone().removeAttr("hidden id");
    newRow.appendTo(table);
    return newRow;
};

$('#priorityList').on('click', '.addRow', function() {
    addRow(this);
});

$('#priorityList').on('click', '.deleteRow', function() {
    deleteRow(this);
});

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
    table = document.getElementById("broadcastList");
    total = table.rows.length-2;
    for(var i=0;i< total;i++) {
        table.deleteRow(2);
    }
};


$('#priorityList').on('click', '.addPriority', function() {
    gAddPriority = true;
    addPriority();
});

$('#priorityList').on('click', '.deletePriority', function() {
    deletePriority(this);
});

// 导出
$('#exportConfigBtn').click(function() {
    var data = JSON.stringify(getAllPrioritiesData(), null, 4);
    var filename = 'broadcast_alarm_config.json';
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

// 导入
$('#importConfigBtn').click(function(event) {
    var files = document.getElementById('files').files;
    console.log(files);
    if (files.length > 0) {
       readConfigFile(files);
    } else {
        alert('请选择配置文本文件');
    }
});

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


var action2Json = function(key, value) {
    var json = {"action_key":key, "action_value":value};
    return json;
};

var appRow2Json = function(pkg_name, b_ids, e_ids, delay) {
    var actionList = [];
    var index = 0;

    if (delay) {
        actionList[index++] = action2Json("delay", delay);
    }
    if (b_ids) {
        actionList[index++] = action2Json("b_ids", b_ids);
    }
    if (e_ids) {
        actionList[index++] = action2Json("e_ids", e_ids);
    }

    var json = {"pkg_name":pkg_name, "action_list":actionList};

    return json;
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

        try {
            var reg = new RegExp(type);
            console.log(reg);
        } catch (err) {
            alert('type:' + type + '\nerror:' + err);
            console.log(err);
            return false;
        }

        if (!priority || !type) {continue;}

        var appTable = rows[i+1].childNodes[1].childNodes[1];
        var appRows = appTable.rows;
        var appList = [];
        var index = 0;
        for(var j=2;j < appRows.length;j++) {
            var pkg_name = $(appRows[j]).find('input[name="pkg_name"]').val();
            if (!pkg_name) { continue; }
            var delay = $(appRows[j]).find('input[name="delay"]').val();
            var b_ids = $(appRows[j]).find('input[name="b_ids"]').val();
            var e_ids = $(appRows[j]).find('input[name="e_ids"]').val();
            var app = appRow2Json(pkg_name, b_ids, e_ids, delay);
            appList[index++] = app;
        }

        var g_broadcast = $(rows[i]).find('input[name="g_broadcast"]').prop('checked');
        var g_delay = $(rows[i]).find('input[name="g_delay"]').val();
        result = {"app_list":appList};
        result["g_broadcast"] = g_broadcast;
        result["g_delay"] = g_delay;
        result = JSON.stringify(result);
        dataArray[count] = {"priority":priority, "type":type, "result":result, pushStrategy: 'ALL'};
        md5Array[count] = {"priority":priority, "type":type, "result":getMD5(result), pushStrategy: 'ALL'};
        count++;
    }
    outArray[0] = dataArray;
    outArray[1] = md5Array;
    return outArray;
}

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

$('#floatingSubmitBtn').on('click', function() {
    submit();
});

$('#allSubmitBtn').click(function() {
    submit();
});


var fillFeatureTable = function(featureTable, priority, type, result) {
    var firstRow = featureTable.rows[1];
    console.log(typeof result);
    var obj = JSON.parse(result);
    // var obj = eval ("(" + result + ")"); // 这个也可以转换, 但上面的更友好
    $(firstRow).find('[name="priority"]').val(priority);
    $(firstRow).find('[name="type"]').val(type);
    $(firstRow).find('[name="g_broadcast"]').prop('checked', obj.g_broadcast);
    $(firstRow).find('[name="g_delay"]').val(obj.g_delay);

};

var fillAppTable = function(appTable, result) {
    var obj = JSON.parse(result);
    var appList = obj.app_list;
    appList.forEach(function(item){
        var newRow = addRowToTable(appTable);
        $(newRow).find('[name="pkg_name"]').val(item.pkg_name);
        var actionList = item.action_list;
        actionList.forEach(function(action){
            var key = '[name="' + action.action_key + '"]';
            var value = action.action_value;
            $(newRow).find(key).val(value);
        });
    });
    if (appList.length < 1) {
        addRowToTable(appTable);
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
        fillBroadcastTable();
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

var getServerConfig = function(region, bucket) {
    region = region || $('#regionSelect').val();
    bucket = bucket || JSON.parse($('#bucketSelect').val());

    console.log(bucket);
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
            console.log(gAllPrioritiesData);
            parsePrioritys(gAllPrioritiesData);
        }
    })
};

// regions : global var
var popRegions = function(regions) {
    console.log('regions:' + regions)
    var select = $('#regionSelect');
    $.each(regions, function(index, value) {
        if (value == 'broadcast_alarm') {
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

var refresh = function() {
    popRegions(regions);
    popBuckets(null, buckets);
}

refresh();
});
