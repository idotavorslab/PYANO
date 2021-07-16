/**@example
 for(...) {
   perf.mark('start');
   // do something
   perf.mark('end');
   perf.measure('start', 'end');
 }
 const measures = perf.getMeasures('start', 'end');
 console.log(measures.name, measures.avg());
 > start -> end 48.01234567891011127*/
exports.__esModule = true;
function mark(markName) {
    window.performance.mark(markName);
}
exports.mark = mark;
function measure(startMark, endMark) {
    window.performance.measure(startMark + " -> " + endMark, startMark, endMark);
}
exports.measure = measure;
function measureMany() {
    var startEndPairs = [];
    for(var _i = 0; _i < arguments.length; _i++) {
        startEndPairs[_i] = arguments[_i];
    }
    for(var _a = 0, startEndPairs_1 = startEndPairs; _a < startEndPairs_1.length; _a++) {
        var _b = startEndPairs_1[_a], start = _b[0], end = _b[1];
        measure(start, end);
    }
}
exports.measureMany = measureMany;
function getMeasures(startMark, endMark) {
    var name = startMark + " -> " + endMark;
    var measures = window.performance.getEntriesByName(name, 'measure');
    var durations = measures.map(function (m) { return m.duration; });
    measures.avg = function () { return sum(durations) / durations.length; };
    measures.name = name;
    return measures;
}
exports.getMeasures = getMeasures;
function getManyMeasures() {
    var startEndPairs = [];
    for(var _i = 0; _i < arguments.length; _i++) {
        startEndPairs[_i] = arguments[_i];
    }
    var manyMeasures = [];
    for(var _a = 0, startEndPairs_2 = startEndPairs; _a < startEndPairs_2.length; _a++) {
        var _b = startEndPairs_2[_a], start = _b[0], end = _b[1];
        manyMeasures.push(getMeasures(start, end));
    }
    return manyMeasures;
}
exports.getManyMeasures = getManyMeasures;
