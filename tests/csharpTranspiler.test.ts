import { Transpiler } from '../src/transpiler';
import { readFileSync } from 'fs';

jest.mock('module',()=>({
    __esModule: true,                    // this makes it work
    default: jest.fn()
  }));

let transpiler: Transpiler;

beforeAll(() => {
    const config = {
        'verbose': false,
        'csharp': {
            'parser': {
                'NUM_LINES_END_FILE': 0,
                "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
                "ELEMENT_ACCESS_WRAPPER_CLOSE": ")"

            }
        }
    }
    transpiler = new Transpiler(config);
})

describe('csharp transpiling tests', () => {
    test('basic variable declaration', () => {
        const ts = "const x = 1;"
        const csharp = "var x = 1;"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic while loop', () => {
        const ts =
        "while (true) {\n" +
        "    const x = 1;\n" +
        "    break;\n" +
        "}"
        
        const csharp =
        "while (true)\n{\n" +
        "    var x = 1;\n" +
        "    break;\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic for loop', () => {
        const ts =
        "for (let i = 0; i < 10; i++) {\n" +
        "    break;\n" +
        "}"
        const csharp =
        "for (var i = 0; i < 10; i++)\n{\n" +
        "    break;\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic method declaration', () => {
        const ts =
        "class T {\n" +
        "    test(): void {\n" +
        "        console.log(\"Hello\")\n" +
        "    }\n" +
        "}"
        const csharp =
        "class T\n" +
        "{\n" +
        "    void test()\n" +
        "    {\n" +
        "        Console.WriteLine(\"Hello\");\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic basic declaration with default parameters', () => {
        const ts = 
        "class T {\n" +
        "    test(s: string): void {\n" +
        "        console.log(\"Hello\")\n" +
        "    }\n" +
        "}"
        const csharp =
        "class T\n" +
        "{\n" +
        "    void test(string s)\n" +
        "    {\n" +
        "        Console.WriteLine(\"Hello\");\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic class inheritance', () => {
        const ts =
        "class t extends ParentClass {\n" +
        "    method () {\n" +
        "\n" +
        "    }\n" +
        "}";
        const csharp =
        "class t : ParentClass\n" +
        "{\n" +
        "    void method()\n" +
        "    {\n" +
        "\n" +
        "    }\n" +
        "}";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    // test('basic identation check [nested if]', () => {
    //     const ts =
    //     "if (1) {\n" +
    //     "    if (2) {\n" +
    //     "        if (3) {\n" +
    //     "            if (4) {\n" +
    //     "                var x = 1;\n" +
    //     "            }\n" +
    //     "        } \n" +
    //     "    }\n" +
    //     "}";
    //     const csharp =
    //     "if (1)\n" +
    //     "{\n" +
    //     "    if (2)\n" +
    //     "    {\n" +
    //     "        if (3)\n" +
    //     "        {\n" +
    //     "            if (4)\n" +
    //     "            {\n" +
    //     "                var x = 1;\n" +
    //     "            }\n" +
    //     "        }\n" +
    //     "    }\n" +
    //     "}"
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // });
    test('basic identation check [if-else-if]', () => {
        const ts =
        "if (false) {\n" +
        "  console.log(\"if\")\n" +
        "} else if (false) {\n" +
        "    console.log(\"else if\")\n" +
        "} else {\n" +
        "    console.log(\"else\")\n" +
        "}"
        const csharp =
        "if (false)\n" +
        "{\n" +
        "    Console.WriteLine(\"if\");\n" +
        "} else if (false)\n" +
        "{\n" +
        "    Console.WriteLine(\"else if\");\n" +
        "} else\n" +
        "{\n" +
        "    Console.WriteLine(\"else\");\n" +
        "}";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic async function declaration [no args]', () => {
        const ts =
        "class t {\n" +
        "    \n" +
        "    async fn (): Promise<void> {\n" +
        "        const x = await this.asyncMethod();\n" +
        "        console.log(\"1\");\n" +
        "    }\n" +
        "}"
        const csharp =
        "class t\n" +
        "{\n" +
        "    async Task fn()\n" +
        "    {\n" +
        "        var x = await this.asyncMethod();\n" +
        "        Console.WriteLine(\"1\");\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic function declaration [with typed args]', () => {
        // to do add support for typed arrays and objects
        const ts =
        "class t {\n" +
        "    parseOrder (a: string, b: number, c: boolean) {\n" +
        "        console.log(\"here\");\n" +
        "    }\n" +
        "}";
        const csharp =
        "class t\n" +
        "{\n" +
        "    void parseOrder(string a, float b, bool c)\n" +
        "    {\n" +
        "        Console.WriteLine(\"here\");\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic function declaration [with initialized args]', () => {
        const ts =
        "class t {\n" +
        "    parseOrder (a = \"hi\", b = 3, bb= 3.2, c = false, d = [], e = {}) {\n" +
        "        // I'm a comment\n" +
        "        console.log(\"here\");\n" +
        "    }\n" +
        "}";
        const csharp =
        "class t\n" +
        "{\n" +
        "    void parseOrder(string a = \"hi\", int b = 3, float bb = 3.2, bool c = false, List<object> d = null, Dictionary<string, object> e = null)\n" +
        "    {\n" +
        "        // I'm a comment\n" +
        "        d ??= new List<object>();\n" +
        "        e ??= new Dictionary<string, object>();\n" +
        "        console.log(\"here\");\n" +
        "    }\n" +
        "}";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic async function declaration [with typed return type]', () => {
        const ts =
        "class t {\n" +
        "    method (s:string): number {\n" +
        "        return 1;\n" +
        "    }\n" +
        "    method2(): void {\n" +
        "        console.log(1)\n" +
        "    }\n" +
        "    method3(): string {\n" +
        "        return \"1\"\n" +
        "    }\n" +
        "    async method4(): Promise<string> {\n" +
        "        return \"1\"\n" +
        "    }\n" +
        "    async method5(): Promise<object> {\n" +
        "        return {\n" +
        "            \"foo\": \"bar\"\n" +
        "        };\n" +
        "    }\n" +
        "}"
        const csharp =
        "class t\n" +
        "{\n" +
        "    float method(string s)\n" +
        "    {\n" +
        "        return 1;\n" +
        "    }\n" +
        "\n" +
        "    void method2()\n" +
        "    {\n" +
        "        Console.WriteLine(1);\n" +
        "    }\n" +
        "\n" +
        "    string method3()\n" +
        "    {\n" +
        "        return \"1\";\n" +
        "    }\n" +
        "\n" +
        "    async Task<string> method4()\n" +
        "    {\n" +
        "        return \"1\";\n" +
        "    }\n" +
        "\n" +
        "    async Task<Dictionary<string, object>> method5()\n" +
        "    {\n" +
        "        return new Dictionary<string, object>() {\n" +
        "            { \"foo\", \"bar\" },\n" +
        "        };\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic function declaration [with inferred return type]', () => {
        transpiler.setPhpAsyncTranspiling(false);
        const ts =
        "class t {\n" +
        "    method1() {\n" +
        "        console.log(1);\n" +
        "    }\n" +
        "    method2() {\n" +
        "        return 1;\n" +
        "    }\n" +
        "    method3() {\n" +
        "        return \"1\";\n" +
        "    }\n" +
        "    method4() {\n" +
        "        return true;\n" +
        "    }\n" +
        "    async method5() {\n" +
        "        return \"1\";\n" +
        "    }\n" +
        "    async method6() {\n" +
        "        return {\n" +
        "            \"foo\": 1\n" +
        "        }\n" +
        "    }\n" +
        "}"
        const csharp =
        "class t\n" +
        "{\n" +
        "    void method1()\n" +
        "    {\n" +
        "        Console.WriteLine(1);\n" +
        "    }\n" +
        "\n" +
        "    float method2()\n" +
        "    {\n" +
        "        return 1;\n" +
        "    }\n" +
        "\n" +
        "    string method3()\n" +
        "    {\n" +
        "        return \"1\";\n" +
        "    }\n" +
        "\n" +
        "    bool method4()\n" +
        "    {\n" +
        "        return true;\n" +
        "    }\n" +
        "\n" +
        "    async Task<string> method5()\n" +
        "    {\n" +
        "        return \"1\";\n" +
        "    }\n" +
        "\n" +
        "    async Task<Dictionary<string, object>> method6()\n" +
        "    {\n" +
        "        return new Dictionary<string, object>() {\n" +
        "            { \"foo\", 1 },\n" +
        "        };\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        transpiler.setPhpAsyncTranspiling(true);
        expect(output).toBe(csharp);
    });
    test('basic class with constructor', () => {
        const ts =
        "class teste extends Test {\n" +
        "    constructor(config = {}) {\n" +
        "        console.log('teste');\n" +
        "        super(config)\n" +
        "    }\n" +
        "}"
        const csharp =
        "class teste : Test\n" +
        "{\n" +
        "    teste(Dictionary<string, object> config = null) : base(config)\n" +
        "    {\n" +
        "        config ??= new Dictionary<string, object>();\n" +
        "        Console.WriteLine(\"teste\");\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic dictonary', () => {
        const ts =
        "const types = {\n" +
        "    'limit': 'limit',\n" +
        "    'market': 'market',\n" +
        "    'margin': 'margin',\n" +
        "}\n" 
        const csharp =
        "var types = new Dictionary<string, object>() {\n" +
        "    { \"limit\", \"limit\" },\n" +
        "    { \"market\", \"market\" },\n" +
        "    { \"margin\", \"margin\" },\n" +
        "};"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('basic binary expressions', () => {
        const ts =
        "const a = 1 + 1;\n" +
        "const b = 2 * 2;\n" +
        "const c = 3 / 3;\n" +
        "const d = 4 - 4;\n" +
        "const e = 5 % 5;\n" +
        "const f = \"foo\" + \"bar\";\n";
        const csharp =
        "var a = 1 + 1;\n" +
        "var b = 2 * 2;\n" +
        "var c = 3 / 3;\n" +
        "var d = 4 - 4;\n" +
        "var e = 5 % 5;\n" +
        "var f = \"foo\" + \"bar\";";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic conditions expressions', () => {
        const ts =
        "const a = true;\n" +
        "const b = false;\n" +
        "const c = true;\n" +
        "const d = (a && b) || (c && !b);\n" 
        const csharp =
        "var a = true;\n" +
        "var b = false;\n" +
        "var c = true;\n" +
        "var d = (a && b) || (c && !b);"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('Should wrap falsy/truthy expressions [with the defined wrapper]', () => {
        const ts =
        "const a = \"hi\";\n" +
        "const b = false;\n" +
        "const c =  a && b;\n" +
        "const d = !a && !b;\n" +
        "const e = (a || !b);\n" +
        "if (a) {\n" +
        "    const f = 1;\n" +
        "}"
        const csharp =
        "var a = \"hi\";\n" +
        "var b = false;\n" +
        "var c = isTrue(a) && b;\n" +
        "var d = !isTrue(a) && !b;\n" +
        "var e = (isTrue(a) || !b);\n" +
        "if (isTrue(a))\n" +
        "{\n" +
        "    var f = 1;\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic element access expression', () => {
        const ts =
        "const x = {};\n" +
        "x[\"teste\"] = 1;";
        const csharp =
        "var x = new Dictionary<string, object>() {};\n" +
        "x[\"teste\"] = 1;";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('should wrap right side of element access expression', () => {
        const ts =
        "const a = {};\n" +
        "const b = a[\"teste\"]\n" +
        "a[\"b\"] = a[\"teste\"];"
        const csharp =
        "var a = new Dictionary<string, object>() {};\n" +
        "var b = getValue(a, \"teste\");\n" +
        "a[\"b\"] = getValue(a, \"teste\");"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    // test('basic throw statement', () => {
    //     const ts =
    //     "function test () {\n" +
    //     "    throw new InvalidOrder (\"error\")\n" +
    //     "}";
    //     const csharp =
    //     "function test() {\n" +
    //     "    throw new InvalidOrder('error');\n" +
    //     "}";
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    test('basic comparison operators', () => {
        const ts =
        "const a = 1;\n" +
        "const b = 1+1;\n" +
        "const c = a === b;\n" +
        "const d = a !== b;\n" +
        "const e = a < b;\n" +
        "const f = a > b;\n" +
        "const g = a >= b;\n" +
        "const h = a <= b;";
        const csharp =
        "var a = 1;\n" +
        "var b = 1 + 1;\n" +
        "var c = a == b;\n" +
        "var d = a != b;\n" +
        "var e = a < b;\n" +
        "var f = a > b;\n" +
        "var g = a >= b;\n" +
        "var h = a <= b;";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic math functions', () => {
        const ts =
        "const num = 5\n" + 
        "const ceil = Math.ceil (num);\n" +
        "const a = Math.min (0, 5);\n" +
        "const b = Math.max (0, 5);\n" +
        "const c = parseFloat ('1.3');\n" +
        "const d = parseInt ('1.3');\n" +
        "const e = Number.MAX_SAFE_INTEGER;\n" +
        "const f = Math.abs (-2);\n" +
        "const g = Math.pow (1, 2);\n" +
        "const h = Math.round (5);\n" +
        "const i = Math.floor (5.5);\n";
        const csharp =
        "var num = 5;\n" +
        "var ceil = Math.Ceiling((double)num);\n" +
        "var a = Math.Min(0, 5);\n" +
        "var b = Math.Max(0, 5);\n" +
        "var c = float.Parse(\"1.3\");\n" +
        "var d = Int32.Parse(\"1.3\");\n" +
        "var e = Int32.MaxValue;\n" +
        "var f = Math.Abs(-2);\n" +
        "var g = Math.Pow(1, 2);\n" +
        "var h = Math.Round((double)5);\n" +
        "var i = Math.Floor(5.5);"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    // test('basic json methods', () => {
    //     const ts =
    //     "const j = JSON.stringify ({ 'a': 1, 'b': 2 });\n" +
    //     "const k = JSON.parse (j);\n";
    //     const csharp =
    //     "$j = json_encode(array(\n" +
    //     "    'a' => 1,\n" +
    //     "    'b' => 2,\n" +
    //     "));\n" +
    //     "$k = json_decode($j, $as_associative_array = true);";
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    test('string length', () => {
        const ts =
        "const myStr = \"test\";\n" +
        "const ff = myStr.length;"
        const csharp =
        "var myStr = \"test\";\n" +
        "var ff = myStr.Length;"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('array length', () => {
        const ts =
        "const myArray = [1, 2, 3];\n" +
        "const aa = myArray.length;"
        const csharp =
        "var myArray = new List<object>() {1, 2, 3};\n" +
        "var aa = myArray.Count;"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic string methods', () => {
        const ts =
        "let a = \"test\";\n" +
        "const w = a.toString();\n" +
        "a+= \"mundo\";\n" +
        "const t = a.split(\",\");\n" +
        "const b = a.length;\n" +
        "const c = a.indexOf(\"t\");\n" +
        "const d = a.toLowerCase();\n" +
        "const e = a.toUpperCase();"
        const csharp =
        "var a = \"test\";\n" +
        "var w = a.ToString();\n" +
        "a += \"mundo\";\n" +
        "var t = a.Split(\",\").ToList<string>();\n" +
        "var b = a.Length;\n" +
        "var c = a.IndexOf(\"t\");\n" +
        "var d = a.ToLower();\n" +
        "var e = a.ToUpper();"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    // test('basic array manipulation', () => {
    //     const ts =
    //     "const myList = [1, 2, 3];\n" +
    //     "const y = myList.join (',')\n" +
    //     "const i = myList.indexOf(1);\n" +
    //     "const listLength = myList.length;\n" +
    //     "const listFirst = myList[0];\n" +
    //     "myList.push (4);\n" +
    //     "myList.pop ();\n" +
    //     "myList.shift ();"
    //     const csharp =
    //     "$myList = [1, 2, 3];\n" +
    //     "$y = implode(',', $myList);\n" +
    //     "$i = array_search(1, $myList);\n" + 
    //     "$listLength = count($myList);\n" +
    //     "$listFirst = $myList[0];\n" +
    //     "$myList[] = 4;\n" +
    //     "array_pop($myList);\n" +
    //     "array_shift($myList);"
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    test('basic conditional expression', () => {
        const ts =
        "const frase = \"ola\";\n" +
        "const test = frase.length > 0 ? frase.length : 0;"
        const csharp =
        "var frase = \"ola\";\n" +
        "var test = frase.Length > 0 ? frase.Length : 0;"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic object methods', () => {
        const ts =
        "const x = {};\n" +
        "const y = Object.keys(x);\n" +
        "const z = Object.values(x);"
        const csharp =
        "var x = new Dictionary<string, object>() {};\n" +
        "var y = new List<string>(x.Keys);\n" +
        "var z = new List<object>(x.Values);";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    // test('basic instanceof statement', () => {
    //     const ts =
    //     "if (e instanceof NullResponse) {\n" +
    //     "    return [];\n" +
    //     "}"
    //     const csharp =
    //     "if (e instanceof NullResponse) {\n" +
    //     "    return [];\n" +
    //     "}"
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    // test('basic typeof expressions', () => {
    //     const ts =
    //     "const response = \"foo\";\n" +
    //     "typeof response !== 'string'\n" +
    //     "typeof response === 'object'\n" +
    //     "typeof response === 'boolean'\n" +
    //     "typeof response === 'number'";
    //     const csharp =
    //     "$response = 'foo';\n" +
    //     "!is_string($response);\n" +
    //     "is_array($response);\n" +
    //     "is_bool($response);\n" +
    //     "(is_int($response) || is_float($response));";
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    // test('basic indexOf string [check existence]', () => {
    //     const ts =
    //     "const myString = \'bar\'\n" +
    //     "const exists = myString.indexOf (\"b\") >= 0;"
    //     const csharp =
    //     "$myString = 'bar';\n" +
    //     "$exists = mb_strpos($myString, 'b') !== false;"
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    // test('basic indexOf array [check existence]', () => {
    //     const ts =
    //     "const x = [1,2,3];\n" +
    //     "const y = x.indexOf(1) >= 0;"
    //     const csharp =
    //     "$x = [1, 2, 3];\n" +
    //     "$y = in_array(1, $x);"
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    test('basic includes string', () => {
        const ts =
        "const myString = \'bar\'\n" +
        "const exists = myString.includes (\"b\");"
        const csharp =
        "var myString = \"bar\";\n" +
        "var exists = myString.Contains(\"b\");"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic includes array', () => {
        const ts =
        "const x = [1,2,3];\n" +
        "const y = x.includes(1);"
        const csharp =
        "var x = new List<object>() {1, 2, 3};\n" +
        "var y = x.Contains(1);"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic as expression', () => {
        const ts =
        "const x = 1;\n" +
        "const a = \"foo\";\n" +
        "const y = x as any;\n" +
        "const t = a as string;\n" +
        "const z = x as number;"
        const csharp =
        "var x = 1;\n" +
        "var a = \"foo\";\n" +
        "var y = x;\n" +
        "var t = a;\n" +
        "var z = x;" 
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic postfixUnary expression', () => {
        const ts =
        "let x = 1;\n" +
        "x++;\n" +
        "let y = 1;\n" +
        "y--;"
        const csharp =
        "var x = 1;\n" +
        "x++;\n" +
        "var y = 1;\n" +
        "y--;"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    // test('should convert Promise.all to Promise\\all', () => {
    //     transpiler.setPhpUncamelCaseIdentifiers(true);
    //     const ts =
    //     "let promises = [ this.fetchSwapAndFutureMarkets (params), this.fetchUSDCMarkets (params) ];\n" +
    //     "promises = await Promise.all (promises);";
    //     const csharp =
    //     "$promises = [$this->fetch_swap_and_future_markets($params), $this->fetch_usdc_markets($params)];\n" +
    //     "$promises = Async\\await(Promise\\all($promises));" 
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    //     transpiler.setPhpUncamelCaseIdentifiers(false);
    // })
    // test('should convert JS doc', () => {
    //     const ts =
    //     "function fetchStatus (params ) {\n" +
    //     "    /**\n" +
    //     "     * @method\n" +
    //     "     * @name aax#fetchStatus\n" +
    //     "     * @description the latest known information on the availability of the exchange API\n" +
    //     "     * @param {object} params extra parameters specific to the aax api endpoint\n" +
    //     "     * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}\n" +
    //     "     */\n" +
    //     "    return 1;\n" +
    //     "}";
    //     const csharp =
    //     "function fetchStatus($params) {\n" +
    //     "    /**\n" +
    //     "     * the latest known information on the availability of the exchange API\n" +
    //     "     * @param {array} params extra parameters specific to the aax api endpoint\n" +
    //     "     * @return {array} a {@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure status structure}\n" +
    //     "     */\n" +
    //     "    return 1;\n" +
    //     "}";
    //     const output = transpiler.transpileCSharp(ts).content;
    //     expect(output).toBe(csharp);
    // })
    test('should convert regular comment', () => {
        const ts =
        "class t {\n" +
        "\n" +
        "    fn(): void {\n" +
        "        // my comment 1\n" +
        "        // my comment 2        \n" +
        "        console.log(\"Hello World!\");\n" +
        "    }\n" +
        "}"
        const csharp =
        "class t\n" +
        "{\n" +
        "    void fn()\n" +
        "    {\n" +
        "        // my comment 1\n" +
        "        // my comment 2\n" +
        "        console.log(\"Hello World!\");\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('should convert leading and trailing comments', () => {
        const ts =
        "// I'm a leading comment\n" +
        "const z = \"my var\" // I'm a trailing comment\n" +
        "const a = \"bar\" // I'm second trailing comment\n";
        const csharp =
        "// I'm a leading comment\n" +
        "var z = \"my var\"; // I'm a trailing comment\n" +
        "var a = \"bar\"; // I'm second trailing comment";
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('basic try-catch-block', () => {
        const ts =
        "try {\n" +
        "    const x = 1;\n" +
        "} catch (e) {\n" +
        "    console.log(e);\n" +
        "}"
        const csharp =
        "try\n{\n" +
        "    var x = 1;\n" +
        "} catch(Exception e)\n{\n" +
        "    Console.WriteLine(e);\n" +
        "}"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    })
    test('should remove cjs import from transpiled code', () => {
        const ts =
        "const {a,b,x} = require  ('ola')  \n" +
        "const myVar = a.b;";
        const csharp = "var myVar = a.b;"
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    test('should remove cjs exports from transpiled code', () => {
        const ts =
        "module.exports = {\n" +
        "    a,\n" +
        "    b,\n" +
        "    c,\n" +
        "}";
        const csharp = ""
        const output = transpiler.transpileCSharp(ts).content;
        expect(output).toBe(csharp);
    });
    // test('should transpile file from path', () => {
    //     transpiler.setPhpUncamelCaseIdentifiers(true);
    //     const csharp = readFileSync ('./tests/files/output/php/test1.php', "utf8");
    //     const output = transpiler.transpileCSharpByPath('./tests/files/input/test1.ts').content;
    //     transpiler.setPhpUncamelCaseIdentifiers(false);
    //     expect(output).toBe(csharp);
    // });
  });