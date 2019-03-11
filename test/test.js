chemicaltoolsbot = require('../index')

var test = function (input) {
    console.log(chemicaltoolsbot(input));
    console.log(chemicaltoolsbot(input, 'zh'));
}

describe('Chemical Tools Bot', function () {

    it("element", function () {
        test('Hf')
        test('哈')
    });

    it("elementtable", function () {
        test('element')
    });

    it("mass", function () {
        test("C6H12O6");
    });

    it("gass", function () {
        test("p 3 1 1")
    });

    it("acid", function () {
        test("HA 0.1 2")
        test("BOH 1 2 7")
    });

    it("deviation", function () {
        test("2.232 2.4554 -2.742 0.5354 2362")
    });

    it("help", function () {
        test("help")
    });

    it("wronginput", function () {
        test("sdfsg")
    });
});