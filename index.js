const chemicaltools = require('chemicaltools')
const i18next = require('i18next')
const format = require('string-format')
format.extend(String.prototype, {})

var reply = function (input) {
    s = input.split(' ')
    if (s.length == 1) {
        if (input.toLowerCase() == "help" || input.toLowerCase() == "h" || input == "帮助") return i18next.t("help")
        if (input.toLowerCase() == "element" || input == "元素") return anwserElementTable()
        result = chemicaltools.searchElement(input)
        if (result) return anwserElement(result)
        result = chemicaltools.calculateMass(input)
        if (result) return anwserMass(result)
        return i18next.t("wronginput")
    } else {
        if (s[0] == "HA" || s[0] == "BOH") return anwserAcid(s)
        if (s[0] == "p" || s[0] == "V" || s[0] == "n" || s[0] == "T") return anwserGas(s)
        return anwserDeviation(s)
    }
}

var anwserElement = function (info) {
    var infolist = ['name', 'symbol', 'iupac', 'number', 'mass', 'origin']
    var output = ''
    infolist.forEach(function (n) {
        output += i18next.t("elementper").format(i18next.t("element." + n), info[n])
    })
    output += i18next.t("wikipedia").format(info.name, info.iupac)
    return output
}

var anwserElementTable = function () {
    var output = ''
    chemicaltools.elementinfo.forEach(function (info) {
        output += "{0}.{1}{2} {3} {4}".format(info.number, info.name, info.symbol, info.iupac, info.mass)
    })
    return output
}

var anwserMass = function (result) {
    var output = i18next.t("masshead").format(result.name, parseFloat(result.mass).toFixed(2))
    for (var i in result.peratom) {
        output += i18next.t("massper").format(result.peratom[i].name, result.peratom[i].iupac, result.peratom[i].symbol, result.peratom[i].atomnumber, parseFloat(result.peratom[i].mass).toFixed(2), parseFloat(result.peratom[i].massper).toFixed(2))
    }
    return output.substring(0, output.length - 1) + i18next.t("period")
}

var anwserAcid = function (s) {
    AorB = (s[0] == "HA" ? true : false)
    var result = chemicaltools.calculateAcid(parseFloat(s[1]), s.slice(2).map(parseFloat), AorB)
    var output = "{0}, c={1}mol/L, ".format(s[0], s[1])
    var i = 1;
    s.slice(2).forEach(function (pKa) {
        output += "pK{0}{1}={2}, ".format((AorB ? "a" : "b"), (s.slice(2).length > 1 ? "{0}".format(i++) : ''), pKa)
    });
    output += i18next.t("pH").format(result.pH.toFixed(2))
    result.ion.forEach(function (ion) {
        output += "\nc({0})={1}mol/L,".format(ion.name, ion.c.toExponential(2))
    })
    output = output.substring(0, output.length - 1) + "."
    return output
}

var anwserGas = function (s) {
    keys = ["p", "V", "n", "T"]
    input = { p: null, V: null, n: null, T: null }
    unit = { p: "kPa", V: "L", n: "mol", T: "K" }
    var i = 1, output = ''
    for (var key in input) {
        input[key] = (s[0] == key ? null : s[i++])
    }
    result = chemicaltools.calculateGas(...keys.map(function (x) {
        return input[x]
    }))
    for (var key in result) {
        if (key != s[0]) output += "{0}={1}{2}, ".format(key, result[key], unit[key])
    }
    output += i18next.t("gas").format(s[0], result[s[0]], unit[s[0]])
    return output
}

var anwserDeviation = function (x) {
    var numnum = Infinity, pointnum = Infinity
    x.forEach(function (xi) {
        var len = xi.length
        var pointlen = 0
        if (xi.substr(0, 1) == "-") len--
        if (xi.indexOf(".") >= 0) {
            len--
            var pointlen = len - xi.indexOf(".")
            if (Math.abs(parseFloat(xi)) < 1) {
                var zeronum = Math.floor(Math.log((Math.abs(parseFloat(xi)))) / Math.LN10)
                len += zeronum
            }
        }
        numnum = Math.min(numnum, len)
        pointnum = Math.min(pointnum, pointlen)
    });
    result = chemicaltools.calculateDeviation(x.map(parseFloat))
    var outputinfo = [
        { name: i18next.t("deviation.input"), value: x.join(", ") },
        { name: i18next.t("deviation.average"), value: result.average.toFixed(pointnum) },
        { name: i18next.t("deviation.ad"), value: result.average_deviation.toFixed(pointnum) },
        { name: i18next.t("deviation.rad"), value: (result.relative_average_deviation * 1000).toExponential(numnum - 1) + "‰" },
        { name: i18next.t("deviation.sd"), value: result.standard_deviation.toExponential(numnum - 1) },
        { name: i18next.t("deviation.rsd"), value: (result.relative_standard_deviation * 1000).toExponential(numnum - 1) + "‰" },
    ]
    var output = ''
    outputinfo.forEach(function (info) {
        output += "{0}： {1}\n".format(info.name, info.value)
    });
    return output
}

var replyi18 = function (input, lang = 'en') {
    i18next.init({
        lng: lang,
        resources: {
            [lang]: require('./locales/{0}.json'.format(lang)),
        }
    })
    return reply(input)
}
module.exports = replyi18
