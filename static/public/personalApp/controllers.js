var personalControllers = angular.module('personalControllers', ['ui.bootstrap']);

personalControllers.controller('RegionCtr', ['$scope', 'Region', function ($scope, Region) {
  $scope.regions = Region.query();

  $scope.freshRegions = function () {
    $scope.regions = Region.query();
    $scope.newRegionName = '';
  };

  $scope.addRegion = function (regionName) {
    var r = new Region({region: regionName});
    r.$save(function () {
      $scope.freshRegions();
    });
  };

  $scope.deleteRegion = function (regionName) {
    Region.delete({region: regionName}, function () {
      $scope.freshRegions();
    });
  }
}]);

personalControllers.controller('ManageCtr', ['$scope', 'GerritProfile', function ($scope, GerritProfile) {
  $scope.useGlobal = false;
  $scope.updateChange = function(change, useGlobal) {
    var env = 'inland';
    if (useGlobal) env = 'global';
    GerritProfile.updateByChange({change: change, env: env});
  };

  $scope.resetProfile = function() {
    GerritProfile.reset();
  }
}]);

personalControllers.controller('BucketCtr', ['$scope', '$routeParams', 'Relation', 'Sid', 'Bucket', 'Backup',
  function ($scope, $routeParams, Relation, Sid, Bucket, Backup) {
    $scope.region = $routeParams.region;

    $scope.getConfigUrl = function (region, bucket, type) {
      if (region === 'power') return 'personal/config_power';
      else if (region === 'power_checker') return 'personal/config_power_checker';
      else if (region === 'broadcast_alarm') return 'personal/config_broadcast_alarm';
      else if("bugreport" == region && "native_crash_profile" == bucket) return '#/regions/' + region + '/buckets/' + bucket + '/profilesXmlEditor';
      else return '#/regions/' + region + '/buckets/' + bucket + '/profiles';
      //else return 'personal/config#/' + region + '/' + bucket + '/' + type;
    };

    $scope.freshUsers = function () {
      $scope.users = Relation.query({region: $scope.region});
      $scope.newUser = '';
    };
    $scope.freshUsers();

    $scope.addUser = function (user) {
      var r = new Relation({region: $scope.region, username: user});
      r.$save(function () {
        $scope.freshUsers();
      });
    };

    $scope.deleteUser = function (user) {
      Relation.delete({region: $scope.region, username: user}, function () {
        $scope.freshUsers();
      });
    };

    $scope.editSid = {edit: false};
    $scope.toggleSid = function() {
      $scope.editSid.edit = !$scope.editSid.edit;
    }

    $scope.freshSid = function () {
      Sid.query({region: $scope.region}, function (sids) {
        $scope.sid = sids[0];
      });
    };

    $scope.freshSid();

    $scope.newSid = function () {
      Sid.save({region: $scope.region}, function (sids) {
        $scope.freshSid();
      });
    };

    $scope.updateSid = function(sid) {
      Sid.update({region: $scope.region, sid: sid}, function(sid) {
        $scope.freshSid();
      });
    }

    $scope.deleteSid = function (sid) {
      Sid.delete({region: $scope.region, sid: sid}, function () {
        $scope.freshSid();
      });
    };

    $scope.freshBuckets = function () {
      $scope.buckets = Bucket.query({region: $scope.region});
      $scope.newBucketName = '';
      $scope.newBucketType = '';
    };
    $scope.freshBuckets();

    $scope.addBucket = function (bucketName, bucketType) {
      Bucket.save({region: $scope.region}, {bucket: bucketName, type: bucketType}, function () {
        $scope.freshBuckets();
      });
    };

    $scope.deleteBucket = function (bucketName) {
      Bucket.delete({region: $scope.region, bucket: bucketName}, function () {
        $scope.freshBuckets();
      });
    };

    $scope.backups = null;
    $scope.backupBucket = null;
    $scope.freshBackups = function (bucket) {
      $scope.backups = Backup.query({region: $scope.region, bucket: bucket});
      console.log($scope.backups);
      $scope.backupBucket = bucket;
    };

    $scope.restoreBackup = function (id) {
      Backup.save({region: $scope.region, bucket: $scope.backupBucket, id: id}, function () {
        $scope.freshBackups($scope.backupBucket);
      });
    };

    $scope.getIdProfileUrl = function (id) {
      return '#/regions/' + $scope.region + '/buckets/' + $scope.backupBucket + '/backups/' + id;
    };

}]);

personalControllers.controller('BackupCtr', ['$scope', '$routeParams', 'Backup',
  function ($scope, $routeParams, Backup) {
    $scope.jsoneditor = {
      options: {
        mode: 'code',
        modes: ['code', 'form', 'tree', 'view']
      }
    };
    $scope.useJson = false;
    $scope.onLoad = function(instance) {
      instance.epandAll();
    }
    $scope.region = $routeParams.region;
    $scope.bucket = $routeParams.bucket;
    $scope.id = $routeParams.id;
    $scope.profileConfigs = {test: [], norm: []};

    var str2json = function(str) {
      var j = undefined;
      try {
        j = JSON.parse(str);
      } catch(err) {
        console.log('it is not json: ' + str);
      }
      return j;
    }

    var extractProfilesJson = function(profiles) {
      profiles.test.forEach(function(p) {
        p.json = str2json(p.result);
      });
      profiles.norm.forEach(function(p) {
        p.json = str2json(p.result);
      });
    }

    $scope.freshProfiles = function () {
      Backup.get({region: $scope.region, bucket: $scope.bucket, id: $scope.id}, function (backup) {
        $scope.backup = backup;
        var profiles = JSON.parse(backup.content);
        extractProfilesJson(profiles);
        $scope.profileConfigs = profiles;

      });
    };
    $scope.freshProfiles();

}]);

personalControllers.controller('ProfileCtr', ['$scope', '$routeParams', 'Profile',
  function ($scope, $routeParams, Profile) {
    $scope.jsoneditor = {
      options: {
        mode: 'code',
        modes: ['code', 'form', 'tree', 'view']
      }
    };
    $scope.useJson = false;

    $scope.onLoad = function(instance) {
      instance.epandAll();
    }
    $scope.region = $routeParams.region;
    $scope.bucket = $routeParams.bucket;

    $scope.profileConfigs = {test: [], norm: []};

    $scope.freshProfiles = function () {
      Profile.query({region: $scope.region, bucket: $scope.bucket}, function (profiles) {
        extractProfilesJson(profiles);
        $scope.profileConfigs = profiles;
        console.log('profiles after extract json: ');
        console.log($scope.profileConfigs);
      });
    };
    $scope.freshProfiles();

    $scope.addProfile = function(mode, index) {
      if (mode == 'test') var s = 'INTERNAL';
      else var s = 'ALL';
      $scope.profileConfigs[mode].splice(index, 0, {pushStrategy: s, pushNumber: -1});
    }

    $scope.delProfile = function(mode, index) {
      $scope.profileConfigs[mode].splice(index, 1);
    }

    var str2json = function(str) {
      var j = undefined;
      try {
        j = JSON.parse(str);
      } catch(err) {
        console.log('it is not json: ' + str);
      }
      return j;
    }

    var extractProfilesJson = function(profiles) {
      profiles.test.forEach(function(p) {
        p.json = str2json(p.result);
      });
      profiles.norm.forEach(function(p) {
        p.json = str2json(p.result);
      });
    }

    var extractProfile = function(profile) {
      var p = profile.priority;
      var t = profile.type;
      var s = profile.pushStrategy;
      var n = profile.pushNumber || -1;
      var c = profile.pushPercent || 0.1;
      var r = profile.result;
      if ($scope.useJson) r = JSON.stringify(profile.json);
      if (!p || !t || !s || !n || !r || !c) return null;
      else return {priority: p, type: t, result: r, pushStrategy: s, pushNumber: n, pushPercent: c};
    };

    var buildDownload = function(filename, content) {
      var blob = new Blob([content], {type: 'text/plain'});
      var downloadLink = angular.element('<a></a>');
      downloadLink.attr('href', (window.URL || window.webkitURL).createObjectURL( blob ));
      downloadLink.attr('download', filename);
      downloadLink.attr('target', '_blank');
      downloadLink[0].click();
    };

    $scope.submitConfig = function() {
      var test = [];
      var norm = [];
      $scope.profileConfigs['test'].forEach(function(profile) {
        var validProfile = extractProfile(profile);
        if (validProfile) test.push(validProfile);
      });
      $scope.profileConfigs['norm'].forEach(function(profile) {
        var validProfile = extractProfile(profile);
        if (validProfile) norm.push(validProfile);
      });
      var csd = {region: $scope.region, bucket: $scope.bucket, test: test, norm: norm};
      if ($scope.useFileProfile) {
        Profile.getFileContent(csd, function(contents) {
          contents.forEach(function(content) {
            buildDownload(content.fileName, content.fileContent);
          });
        });
      }
      else {
        Profile.getContent(csd, function(contents) {
          contents.forEach(function(content) {
            buildDownload(content.fileName, content.fileContent);
          });
        });
      }
    };

    $scope.resetConfig = function() {
      Profile.deleteAll({region: $scope.region, bucket: $scope.bucket}, function() {
        $scope.freshProfiles();
      });
    };
}]);


// this contoller is used for xml editor page
personalControllers.controller('XmlEditorCtr', ['$scope', '$routeParams', 'Profile', 'Count',
  function ($scope, $routeParams, Profile, Count) {
    // get the data from backend
    $scope.region = $routeParams.region;
    $scope.bucket = $routeParams.bucket;

    $scope.profiles = {};
    $scope.xmlContent = "";
    $scope.jsonObj = {};
    $scope.rules = {};
    $scope.counts = {};

    // show the result message when save
    $scope.errorMessage = "";
    $scope.saveSuccess = "";

    var countBucket = "native_crash_count";

    // selection data - rule.core
    $scope.cores = [
        {name: "Default", value: "default"},
        {name: "Full",    value: "full"},
        {name: "None",    value: "none"}
    ];

    // selection data - rule.jstack
    $scope.jstacks = [
        {name: "All",     value: "all"},
        {name: "Current", value: "current"},
        {name: "None",    value: "none"}
    ];

    // selection data - rule.file
    $scope.filekewordpath = [
        {name: "Keyword", value: "keyword"},
        {name: "Path",    value: "path"}
    ];

    $scope.filedumpstat = [
        {name: "Dump", value: "dump"},
        {name: "Stat", value: "stat"}
    ];

    // handle the checkbox
    $scope.isChecked = function(value) {
        if("" == value)
            return true;
        else
            return false;
    };

    // format the file info in rules
    var formatFileInfo = function (rules) {
        for(var k1 in rules) {
            // reset the fileinfo at first
            $scope.rules[k1].formatData = {};
            $scope.rules[k1].formatData.fileInfo = [];

            $scope.rules[k1].errorMessage = "";
            $scope.rules[k1].saveSuccess = "";

            for (var k2 in rules[k1].file) {
                var length = rules[k1].file[k2].length;
                if (length && length > 1) {
                    for (var k3 in rules[k1].file[k2])  {
                        // push into the list
                        $scope.rules[k1].formatData.fileInfo.push({
                            keywordpath: k2,
                            dumpstat: rules[k1].file[k2][k3]._action,
                            text: rules[k1].file[k2][k3].__text
                        });
                    }
                }
                else {
                    // push into the list
                    $scope.rules[k1].formatData.fileInfo.push({
                        keywordpath: k2,
                        dumpstat: rules[k1].file[k2]._action,
                        text: rules[k1].file[k2].__text
                    });
                }
            }

            console.log("rule: " + Number(Number(k1) + Number(1)) + ", file: " + JSON.stringify($scope.rules[k1].formatData));
        }
    };

    // format the select data
    var formatSelectData = function(rules) {
        for(var key in rules) {
            var rule = rules[key];

            // core
            if("" == rule.core)
                rule.core = "default";
            else if(!rule.core || null == rule.core)
                rule.core = "none";
            else
                rule.core = "full";

            // jstack
            if("" == rule.jstack)
                rule.jstack = "current";
            else if(!rule.jstack || null == rule.jstack)
                rule.jstack = "none";
            else
                rule.jstack = "all";
        }
    };

    // hanle the file addition
    // Angular JS可以实现双向数据绑定，可以解决我们在页面上对数据进行动态调整
    $scope.addFile = function(fileInfo) {
        var fileBaseInfo = {
            keywordpath: "",
            dumpstat: "",
            text: ""
        };
        fileInfo.push(fileBaseInfo);
    };

    // handle the rule addition
    $scope.addRule = function() {
        var baseRuleInfo = {
            id: "",
            pn: "",
            bt: "",
            core: "default",
            jstack: "none",
            mlog: "",
            slog:"",
            maps:"",
            tomb:"",
            file: {},
            filter: {},
            formatData: {
                fileInfo: []
            },
            isNewRule: true,
            showFilter: false,
            showRule: true,
            count: 0,
            errorMessage: "",
            saveSuccess: ""
        };

        if(!$scope.rules) {
            $scope.rules = [];
        }

        $scope.rules.push(baseRuleInfo);
    };

    // handle the delete operation
    $scope.deleteElement = function(deleteElementHashKey, array) {
        for (var key in array) {
            if(deleteElementHashKey == (array[key].$$hashKey)) {
                console.log("delete this element, hash key = " + deleteElementHashKey);
                array.splice(key, 1);
                break;
            }
        }
    };

    // edit the check box data
    $scope.editCheckboxData = function($event, rule) {
        var val = $event.target.checked;
        var key = $event.target.id;

        if(!val || false == val) {
            console.log("delete " + key + " from rule, rule.hashkey = " + rule.$$hashKey);
            delete rule[key];
        }
        else {
            console.log("add " + key + " to rule, rule.hashkey = " + rule.$$hashKey);
            rule[key] = "";
        }
    };

    var checkValue = function(value) {
        if(!value || "" == value.trim())
            return false;
        else
            return true;
    };

    var validateTextData = function(value) {
        if(!checkValue(value)) {
            return false;
        }
        else {
            value = value.trim();
            return true;
        }
    };

    // validate the rules' value
    var validateFormData = function(rules) {
        var result = {
            isError: false,
            errorMessage: "",
            rules: {}
        };

        for (var k1 in rules) {
            var rule = rules[k1];

            // id, 必须为8位数字（如“15122714”）,且不能与其他规则的id冲突
            if (!checkValue(rule.id)) {
                result.isError = true;
                result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的id不能为空";
                return result;
            }

            rule.id = rule.id.trim();
            var id = rule.id;
            var re = new RegExp("^\\d{8}$");

            if(!re.test(id)) {
                result.isError = true;
                result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的id " + id + " 必须为8位数字";
                return result;
            }

            for (var k2 in rules) {
                if (k1 !== k2) {
                    if (!rules[k2].id)
                        continue;

                    if(id == rules[k2].id.trim())   {
                        result.isError = true;
                        result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的id " + id + " 与其他Rule（第" + Number(Number(k2)+Number(1)) + "条）重复";
                        return result;
                    }
                }
            }

            // pn
            if(!checkValue(rule.pn)) {
                result.isError = true;
                result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的pn不能为空";
                return result;
            }
            else
                rule.pn = rule.pn.trim();

            // bt
            validateTextData(rule.bt);

            if ("s" == rule.pn.toLowerCase() || "a" == rule.pn.toLowerCase()) {
                if(!rule.bt || "" == rule.bt) {
                    result.isError = true;
                    result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的bt不能为空（当pn值为S或A时） ";
                    return result;
                }
            }

            // file
            var fileInfo = rule.formatData.fileInfo;
            for(var k2 in fileInfo) {
                var keywordpath = fileInfo[k2].keywordpath.trim();
                var dumpstat = fileInfo[k2].dumpstat.trim();
                var text = fileInfo[k2].text.trim();

                if ("" == keywordpath) {
                    result.isError = true;
                    result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的File请选择Keyword or Path";
                    return result;
                }

                if ("" == dumpstat) {
                    result.isError = true;
                    result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的File请选择Dump or Stat";
                    return result;
                }

                if ("" == text) {
                    result.isError = true;
                    result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的File请输入文件地址";
                    return result;
                }

                fileInfo[k2].keywordpath = keywordpath;
                fileInfo[k2].dumpstat = dumpstat;
                fileInfo[k2].text = text;
            }

            // filter
            if (null != rule.filter) {
                var hasModel = validateTextData(rule.filter.model);
                var hasDevice = validateTextData(rule.filter.device);

                if(!hasModel)
                    delete rule.filter.model;
                if(!hasDevice)
                    delete rule.filter.device;

                var hasDev = false;
                var hasAlpha = false;
                var hasStable = false;

                if(null != rule.filter.version) {
                    hasDev = validateTextData(rule.filter.version._dev);
                    hasAlpha = validateTextData(rule.filter.version._alpha);
                    hasStable = validateTextData(rule.filter.version._stable);

                    // this format must be xx.xx.xx, xx is number, maybe 1 or 2 number
                    var versionReg = new RegExp("^\\d{1,2}\\.\\d{1,2}\\.\\d{1,2}$");

                    // dev
                    if(!hasDev)
                        delete rule.filter.version._dev;
                    else {
                        var dev = rule.filter.version._dev;
                        if(!versionReg.test(dev) && "none" != dev.toLowerCase()) {
                            result.isError = true;
                            result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的Dev " + dev + " 必须符合数字规范或为none，如11.22.33";
                            return result;
                        }
                    }

                    // alpha
                    if(!hasAlpha)
                        delete rule.filter.version._alpha;
                    else {
                        var alpha = rule.filter.version._alpha;
                        if(!versionReg.test(alpha) && "none" != alpha.toLowerCase()) {
                            result.isError = true;
                            result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的Alpha " + alpha + " 必须符合数字规范或为none，如11.22.33";
                            return result;
                        }
                    }

                    // stable
                    if(!hasStable)
                        delete rule.filter.version._stable;
                    else {
                        var stable = rule.filter.version._stable;
                        if(!versionReg.test(stable) && "none" != stable.toLowerCase()) {
                            result.isError = true;
                            result.errorMessage = "第" + Number(Number(k1)+Number(1)) + "条Rule的Stable " + stable + " 必须符合数字规范或为none，如11.22.33";
                            return result;
                        }
                    }
                }

                if (!hasModel && !hasDevice && !hasDev && !hasAlpha && !hasStable)
                    delete rule.filter;
            }
        }

        // result
        result.isError = false;
        result.rules = rules;

        return result;
    };

    // save the rules data
    $scope.submitRules = function(rules) {
        // 1. remove the $$hashKey, AngularJS will add $$hashkey to our object
        rules = angular.toJson(rules);
        rules = JSON.parse(rules);

        $scope.errorMessage = "";
        $scope.saveSuccess = "";

        // 2. we must validate the all the value
        var result = validateFormData(rules);
        if(result.isError) {
            $scope.errorMessage = "保存失败，原因：" + result.errorMessage;
            console.log($scope.errorMessage);
            return;
        }
        else {
            $scope.errorMessage = "";
            rules = result.rules;
        }

        // 3. we must covert the core, jstack to its orginal format
        for(var k1 in rules) {
            var rule = rules[k1];

            // core
            var value = rule.core;
            if("default" == value)
                rule.core = "";
            else if("full" == value)
                rule.core = {
                    _type: "full"
                };
            else
                delete rule.core;

            // jstack
            var value = rule.jstack;
            if("current" == value)
                rule.jstack = "";
            else if("all" == value)
                rule.jstack = {
                    _type: "all"
                };
            else
                delete rule.jstack;
        }

        // 4. we must conver the file data to its orginal format
        for(var k1 in rules) {
            var fileInfo = rules[k1].formatData.fileInfo;

            if (null == fileInfo)
                break;

            // init the file at first
            rules[k1].file = {
                path: [],
                keyword: []
            };

            for(var k2 in fileInfo) {
                rules[k1].file[fileInfo[k2].keywordpath].push({
                    _action: fileInfo[k2].dumpstat,
                    __text:  fileInfo[k2].text
                });
            }

            // delete empty array
            if(0 == rules[k1].file.path.length && 0 == rules[k1].file.keyword.length)
                delete rules[k1].file;
            else {
                if(0 == rules[k1].file.path.length)
                    delete rules[k1].file.path;
                if(0 == rules[k1].file.keyword.length)
                    delete rules[k1].file.keyword;
            }

            // delete the useless data
            delete rules[k1].formatData;
            delete rules[k1].isNewRule;
            delete rules[k1].showFilter;
            delete rules[k1].showRule;
            delete rules[k1].count;
            delete rules[k1].errorMessage;
            delete rules[k1].saveSuccess;
        }

        // 5. set the new rules json to json obj
        if (0 == rules.length) {
            $scope.jsonObj['rule-manifest'] = {};
        }
        else {
            if(!$scope.jsonObj || !$scope.jsonObj['rule-manifest']) {
                $scope.jsonObj = {
                    'rule-manifest': {}
                };
            }

            $scope.jsonObj['rule-manifest'].rule = rules;
        }

        console.log("$scope.jsonObj:");
        console.log(JSON.stringify($scope.jsonObj));

        // 6. convert the json to xml
        var x2js = new X2JS();
        var xmlData = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + x2js.json2xml_str($scope.jsonObj);

        xmlData = xmlData.replace(/<bt><\/bt>/g,     "<bt/>");
        xmlData = xmlData.replace(/<maps><\/maps>/g, "<maps/>");
        xmlData = xmlData.replace(/<tomb><\/tomb>/g, "<tomb/>");
        xmlData = xmlData.replace(/<mlog><\/mlog>/g, "<mlog/>");
        xmlData = xmlData.replace(/<slog><\/slog>/g, "<slog/>");
        xmlData = xmlData.replace(/<elog><\/elog>/g, "<elog/>");
        xmlData = xmlData.replace(/<rlog><\/rlog>/g, "<rlog/>");
        xmlData = xmlData.replace(/<klog><\/klog>/g, "<klog/>");
        xmlData = xmlData.replace(/<ps><\/ps>/g,     "<ps/>");
        xmlData = xmlData.replace(/<lsof><\/lsof>/g, "<lsof/>");
        xmlData = xmlData.replace(/<spec><\/spec>/g, "<spec/>");

        console.log("Print the final data: ");
        console.log(xmlData);
        $scope.finalXml = xmlData;


        // 7. submit the data
        for(var key in $scope.profiles.norm) {
            if ("rule" == $scope.profiles.norm[key].type) {
                $scope.profiles.norm[key].result = xmlData;
                console.log("final submit config: ");
                console.log(JSON.stringify($scope.profiles));

                // submit
                Profile.update({region: $scope.region, bucket: $scope.bucket, test: $scope.profiles.test, norm: $scope.profiles.norm}, function() {
                    $scope.saveSuccess = "恭喜你，保存成功！";
                    console.log("恭喜你，保存成功！");

                    $scope.freshProfiles();
                });

                break;
            }
        };
    };

    var trimValue = function(value) {
        if(!value)
            return "";
        else
            return value.trim();
    };

    // do we need to show/hide filter
    var controlFilterShowHide = function(rules) {
        for (var key in rules) {
            var rule = rules[key];

            if (!rule.filter) {
                continue;
            }

            var model  = rule.filter.model;
            var device = rule.filter.device;

            trimValue(model);
            trimValue(device);

            var dev    = "";
            var stable = "";
            var alpha  = "";

            if (null != rule.filter.version) {
                dev    = rule.filter.version._dev;
                stable = rule.filter.version._stable;
                alpha  = rule.filter.version._alpha;

                trimValue(dev);
                trimValue(stable);
                trimValue(alpha);
            }

            if ("" == model && "" == device && "" == dev && "" == stable && "" == alpha) {
                rule.showFilter = false;

                delete rule.filter;
            }
            else {
                rule.showFilter = true;
            }
        }
    };

    $scope.addFilter = function(rule) {
        rule.filter = {
            model: "",
            device: "",
            version: {
                _dev: "",
                _stable: "",
                _alpha: ""
            }
        };
        rule.showFilter = true;
    };

    $scope.deletefilter = function(rule) {
        delete rule.filter;
        rule.showFilter = false;
    };

    // rule, show or hide
    var controlRuleShowHide = function(rules) {
        for (var key in rules)
            rules[key].showRule = false;
    };

    $scope.showRule = function(rule) {
        rule.showRule = true;
    };

    $scope.hideRule = function(rule) {
        rule.showRule = false;
    };

    $scope.showBtPlaceHolderInfo = function(value) {
        if (value)
            return "backtrace";
        else
            return "";
    };

    // add counts info to rules
    var addCountsToRules = function(counts, rules) {
        for(var k1 in rules) {
            var rule = rules[k1];

            // default is 0
            rule.count = 0;

            for (var k2 in counts) {
                if(counts[k2].type == rule.id) {
                     console.log("add count " + counts[k2].count + " to rule, rule id = " + rule.id);
                     rule.count = counts[k2].count;
                     break;
                }
            }
        }
    };

    // add count
    $scope.addCount = function(rule) {
        rule.errorMessage = "";
        rule.saveSuccess = "";

        // check if count is number
        var reg = new RegExp("^[0-9]*$");
        if(!reg.test(rule.count)) {
            rule.errorMessage = "count必须为数字，增加Count失败! count = " + rule.count;
            return;
        }

        rule.count++;
    };

    // minus count
    $scope.minusCount = function(rule) {
        rule.errorMessage = "";
        rule.saveSuccess = "";

        // check if count is number
        var reg = new RegExp("^[0-9]*$");
        if(!reg.test(rule.count)) {
            rule.errorMessage = "count必须为数字，减少Count失败! count = " + rule.count;
            return;
        }

        if (0 == rule.count) {
            rule.errorMessage = "count不能小于0! count = " + rule.count;
            return;
        }

        rule.count--;
    };

    // save count to redis
    $scope.saveCount = function(id, count, rule) {
        rule.errorMessage = "";
        rule.saveSuccess = "";

        if (!checkValue(id)) {
             rule.errorMessage = "id无效，保存count失败! id = " + id;
             return;
        }

        id = id.trim();

        // check if count is number
        var reg = new RegExp("^[0-9]*$");
        if(!reg.test(count)) {
            rule.errorMessage = "count必须为数字，保存count失败! count = " + count;
            return;
        }

        // before save count value, get its previous value at first
        Count.get({region: $scope.region, bucket: countBucket, type: id}, function (counts) {
            var previousCountValue = 0;
            if(null != counts)
                previousCountValue = counts.count;

            Count.update({region: $scope.region, bucket: countBucket, type: id, count: count}, function() {
                rule.saveSuccess = "保存成功！id = " + id + ", 技数现值为：" + count + ", 前值为：" + previousCountValue;
            });
        });
    };

    // refresh the page
    $scope.freshProfiles = function () {
        Profile.query({region: $scope.region, bucket: $scope.bucket}, function (profiles) {
            // get the xml info from the result
            $scope.profiles = profiles;
            $scope.xmlContent = "";

            for(var key in $scope.profiles.norm) {
                if ("rule" == $scope.profiles.norm[key].type) {
                    $scope.xmlContent = $scope.profiles.norm[key].result;
                    console.log("xmlContent: ");
                    console.log($scope.xmlContent);
                    break;
                }
            };

            // parse the xmlContent
            var x2js = new X2JS();
            $scope.jsonObj = x2js.xml_str2json($scope.xmlContent);
            $scope.rules = [];
            if(!$scope.jsonObj || !$scope.jsonObj['rule-manifest'].rule) {
                $scope.jsonObj = {};
                return;
            }

            if(!$scope.jsonObj['rule-manifest'].rule.length) {
                $scope.rules.push($scope.jsonObj['rule-manifest'].rule);
            }
            else {
                $scope.rules  = $scope.jsonObj['rule-manifest'].rule;
            }

            if(!$scope.rules || !$scope.rules.length || 0 == $scope.rules.length) {
                $scope.rules = [];
                return;
            }

            // we must format the file, core, jstack info in the $scope.rules
            formatFileInfo($scope.rules);
            formatSelectData($scope.rules);

            // do we need to show filter info?
            controlFilterShowHide($scope.rules);
            controlRuleShowHide($scope.rules);

            // get counts
            Count.query({region: $scope.region, bucket: countBucket}, function (counts) {
                $scope.counts = counts;

                console.log("count:");
                console.log(JSON.stringify($scope.counts));

                // add counts info to rules
                addCountsToRules($scope.counts, $scope.rules);

                // print the rules info
                console.log("rules:");
                console.log(JSON.stringify($scope.rules));
            });
        });
    };
    $scope.freshProfiles();
}]);
