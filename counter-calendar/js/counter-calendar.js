(function ($) {
    $.fn.extend({
        counterCalendar: function (option, accList) {
            // 默认设置
            var defaultOption = {
                date: new Date()
            }
            option = $.extend(defaultOption, option);

            var that = $(this);
            that.append(outerHTML());
            var daysData = getDaysData(option.date);
            showCalendar(daysData);

            // 上个月
            $(".cal-prev").click(function () {
                var year = +$(".cal-year").text();
                var month = $(".cal-month").text() - 1;
                if (month < 1) {
                    year -= 1;
                    month = 12;
                }

                var date = new Date(year, month - 1, 1);
                showCalendar(getDaysData(date));
            });

            // 下一月
            $(".cal-next").click(function () {
                var year = +$(".cal-year").text();
                var month = +$(".cal-month").text() + 1;
                if (month > 12) {
                    year += 1;
                    month = 1;
                }

                var date = new Date(year, month - 1, 1);
                showCalendar(getDaysData(date));
            });

            $("#cal-set").on("click", "dd", function () {
                var ids = $(this).attr("data-ids");
                document.getElementById("pass-data-ids").value = ids;
            });

            // 获取该月第一天是星期几
            function getFirstDay(date) {
                date = date || new Date();
                date.setDate(1);
                return date.getDay();
            }

            // 获取该月的天数
            function getCountDays(date) {
                date = date || new Date();
                date.setMonth(date.getMonth() + 1);
                date.setDate(0);
                return date.getDate();
            }

            // 获取要显示的日期数据
            function getDaysData(date) {
                date = date || new Date();
                monthDate = date.getFullYear() + '-' + (date.getMonth() + 1)
                var firstDay = getFirstDay(date);
                var countDays = getCountDays(date);
                var daysData = [];
                var monthData = getMonthData(accList, countDays, date);
                for (var i = 0, len = countDays; i < len; i++) {
                    daysData.push({
                        day: i + 1,
                        special: "",
                        week: (i + firstDay) % 7,
                        counter: monthData[i].length,
                        ids: monthData[i],
                        full: monthDate + '-' + (i + 1),
                        default: true
                    });
                }
                daysData.year = date.getFullYear();
                daysData.month = date.getMonth() + 1;
                return daysData;
            }

            // 显示日历
            function showCalendar(data) {
                $("#cal-set").children("dd").remove();
                var calHTML = '<dd style="margin-left: ' + 70 * parseInt(data[0].week) + 'px" data-default="' + data[0].default + '" id="calendar-day-' + data[0].day + '" data-ids="' + data[0].full + ':' + data[0].ids + '">' +
                    '<span class="cal-day">' + data[0].day + '</span>' +
                    '<span class="cal-special">' + data[0].special + '</span>' +
                    '<span class="cal-counter" style="background-color: #00ced1" id="counter-span">' + (data[0].counter === "" ? "" : "" + data[0].counter) + '</span>' +
                    '</dd>';
                for (var i = 1, len = data.length; i < len; i++) {
                    calHTML += '<dd data-default="' + data[i].default + '" id="calendar-day-' + data[i].day + '" data-ids="' + data[i].full + ':' + data[i].ids + '">' +
                        '<span class="cal-day">' + data[i].day + '</span>' +
                        '<span class="cal-special">' + data[i].special + '</span>' +
                        '<span class="cal-counter" style="background-color: #00ced1" id="counter-span">' + (data[i].counter === "" ? "" : "" + data[i].counter) + '</span>' +
                        '</dd>';
                }
                ;
                $(".cal-year").html(data.year);
                $(".cal-month").html(data.month);

                $("#cal-set").append(calHTML);
            }

            function getMonthData(list, days, date) {
                var initFlag = false;
                if (list == "undefined" || list == null)
                    initFlag = true;
                var data = new Array();
                if (initFlag) {
                    for (i = 0; i < days; i++) {
                        data.push(0);
                    }
                    return data;
                }
                data = getAccCounter(list, days, date)
                return data;
            }

            function getAccCounter(list, days, date) {
                year = date.getFullYear();
                month = date.getMonth();
                var firsts = year + '-' + (month + 1) + '-01';
                var lasts = year + '-' + (month + 1) + '-' + days;
                var ids = getIdsArray(firsts, lasts, list, days);
                counter = new Array();
                for (d in ids) {
                    counter.push(ids[d].length);
                }
                return ids;
            }

            function getIdsArray(firstDay, lastDay, list, days) {
                var mfirst = getSec(firstDay + ' 00:00:00');
                var mlast = getSec(lastDay + ' 23:59:59');
                var idArray = new Array();
                for (var k = 0; k < days; k++) {
                    idArray[k] = new Array();
                }
                for (i in list) {
                    var acc = list[i];
                    var is_finish = acc.is_finish;
                    var afirst = acc.start_time;
                    var alast = acc.end_time;
                    if (is_finish == '否') {
                        alast = Date.parse(new Date()) / 1000
                    }
                    var edgeArray = getEdge(mfirst, mlast, afirst, alast);
                    if (edgeArray == null) {
                        continue;
                    }
                    else {
                        if (edgeArray.length != 2) {
                            continue;
                        }
                        var mstart = getSDay(edgeArray[0]);
                        var mend = getEDay(edgeArray[1]);
                        for (var j = mstart - 1; j < mend; j++) {
                            var items = idArray[j];
                            items.push(acc.id);
                            idArray[j] = items;
                        }
                    }
                }
                return idArray;
            }

            function test() {
                var ss = new Date(1488297600000);//2017-03-01 00:00:00 1
                var em = new Date(1490975999000);//2017-03-31 23:59:59 31
                var es = new Date(1488211200000);//2017-02-28 00:00:00 28
                var ss = new Date(1488297600000);//2017-03-01 00:00:00 1
                console.log(ss.getDate(), em.getDate(), es.getDate(), ss.getDate());
            }

            function getSDay(dateTime) {
                var date = new Date(dateTime * 1000);
                return date.getDate();
            }

            function getEDay(dateTime) {
                var date = new Date(dateTime * 1000);
                if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0) {
                    return date.getDate() - 1;
                }
                return date.getDate();
            }

            function getEdge(mfirst, mlast, afirst, alast) {
                if (mfirst < afirst) {
                    if (mlast < afirst) {
                        return null;
                    } else {
                        if (mlast < alast) {
                            return new Array(afirst, mlast);
                        } else {
                            return new Array(afirst, alast);
                        }
                    }
                } else if (mfirst > alast) {
                    return null;
                } else {
                    if (mlast < alast) {
                        return new Array(mfirst, mlast);
                    } else {
                        return new Array(mfirst, alast);
                    }
                }
            }

            function getSec(dateStr) {//毫秒1490976000
                var date = new Date(dateStr);
                return Date.parse(date) / 1000;
            }


            function outerHTML() {
                var html = '<div id="cal-set-ctn">' +
                    '   <h2>' +
                    '       <span class="cal-prev">&lt;</span>' +
                    '       <span class="cal-date">' +
                    '           <span class="cal-year"></span> 年' +
                    '           <span class="cal-month"></span> 月' +
                    '       </span>' +
                    '       <span class="cal-next">&gt;</span>' +
                    '   </h2>' +
                    '   <dl id="cal-set">' +
                    '       <dt><strong>日</strong></dt>' +
                    '       <dt>一</dt>' +
                    '       <dt>二</dt>' +
                    '       <dt>三</dt>' +
                    '       <dt>四</dt>' +
                    '       <dt>五</dt>' +
                    '       <dt><strong>六</strong></dt>' +
                    '   </dl>' +
                    '   <div >' +
                    '      <label >点击日历查看详情</label>' +
                    '   </div>' +
                    '</div>';
                return html;
            }
        }
    })
})(jQuery)
