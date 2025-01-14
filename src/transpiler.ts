import ts from 'typescript';
import currentPath from "./dirname.cjs";
import { PythonTranspiler } from './pythonTranspiler.js';
import { PhpTranspiler } from './phpTranspiler.js';
import { CSharpTranspiler } from './csharpTranspiler.js';
import * as path from "path";
import { Logger } from './logger.js';
import { IFileExport, IFileImport, ITranspiledFile } from './types.js';

const __dirname_mock = currentPath;

enum Languages {
    Python,
    Php,
    CSharp,
}

enum TranspilationMode {
    ByPath,
    ByContent
}

function getProgramAndTypeCheckerFromMemory (rootDir: string, text: string, options: any = {}): [any,any,any]  {
    options = options || ts.getDefaultCompilerOptions();
    const inMemoryFilePath = path.resolve(path.join(rootDir, "__dummy-file.ts"));
    const textAst = ts.createSourceFile(inMemoryFilePath, text, options.target || ts.ScriptTarget.Latest);
    const host = ts.createCompilerHost(options, true);
    function overrideIfInMemoryFile(methodName: keyof ts.CompilerHost, inMemoryValue: any) {
        const originalMethod = host[methodName] as Function; // eslint-disable-line
        host[methodName] = (...args: unknown[]) => {
            // resolve the path because typescript will normalize it
            // to forward slashes on windows
            const filePath = path.resolve(args[0] as string);
            if (filePath === inMemoryFilePath)
                return inMemoryValue;
            return originalMethod.apply(host, args);
        };
    }

    overrideIfInMemoryFile("getSourceFile", textAst);
    overrideIfInMemoryFile("readFile", text);
    overrideIfInMemoryFile("fileExists", true);

    const program = ts.createProgram({
        options,
        rootNames: [inMemoryFilePath],
        host
    });

    const typeChecker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(inMemoryFilePath);

    return [ program, typeChecker, sourceFile];
}

export default class Transpiler {
    config;
    pythonTranspiler: PythonTranspiler;
    phpTranspiler: PhpTranspiler;
    csharpTranspiler: CSharpTranspiler;
    constructor(config = {}) {
        this.config = config;
        const phpConfig = config["php"] || {};
        const pythonConfig = config["python"] || {};
        const csharpConfig = config["csharp"] || {};

        if ("verbose" in config) {
            Logger.setVerboseMode(config['verbose']);
        }

        this.pythonTranspiler = new PythonTranspiler(pythonConfig);
        this.phpTranspiler = new PhpTranspiler(phpConfig);
        this.csharpTranspiler = new CSharpTranspiler(csharpConfig);
    }

    setVerboseMode(verbose: boolean) {
        Logger.setVerboseMode(verbose);
    }
    
    createProgramInMemoryAndSetGlobals(content) {
        const [ memProgram, memType, memSource] = getProgramAndTypeCheckerFromMemory(__dirname_mock, content);
        global.src = memSource;
        global.checker = memType as ts.TypeChecker;
        global.program = memProgram;
    }

    createProgramByPathAndSetGlobals(path) {
        const program = ts.createProgram([path], {});
        const sourceFile = program.getSourceFile(path);
        const typeChecker = program.getTypeChecker();

        global.src = sourceFile;
        global.checker = typeChecker;
        global.program = program;
    }

    checkFileDiagnostics() {
        const diagnostics = ts.getPreEmitDiagnostics(global.program, global.src);
        if (diagnostics.length > 0) {
            let errorMessage = "Errors found in the typescript code. Transpilation might produce invalid results:\n";
            diagnostics.forEach( msg => {
                errorMessage+= "  - " + msg.messageText + "\n";
            });
            Logger.warning(errorMessage);
        }
    }

    transpile(lang: Languages, mode: TranspilationMode, file: string): ITranspiledFile {

        if (mode === TranspilationMode.ByPath) {
            this.createProgramByPathAndSetGlobals(file);
        } else {
            this.createProgramInMemoryAndSetGlobals(file);
        }

        // check for warnings and errors
        this.checkFileDiagnostics();

        let transpiledContent = undefined;
        switch(lang) {
        case Languages.Python:
            transpiledContent = this.pythonTranspiler.printNode(global.src, -1);
            break;
        case Languages.Php:
            transpiledContent = this.phpTranspiler.printNode(global.src, -1);
            break;
        case Languages.CSharp:
            transpiledContent = this.csharpTranspiler.printNode(global.src, -1);
        }

        const imports = this.pythonTranspiler.getFileImports(global.src);
        const exports = this.pythonTranspiler.getFileExports(global.src);

        Logger.success("transpilation finished successfully");

        return {
            content: transpiledContent,
            imports,
            exports
        };
    }

    transpilePython(content): ITranspiledFile {
        return this.transpile(Languages.Python, TranspilationMode.ByContent, content);
    }

    transpilePythonByPath(path): ITranspiledFile {
        return this.transpile(Languages.Python, TranspilationMode.ByPath, path);
    }

    transpilePhp(content): ITranspiledFile {
        return this.transpile(Languages.Php, TranspilationMode.ByContent, content);
    }

    transpilePhpByPath(path): ITranspiledFile {
        return this.transpile(Languages.Php, TranspilationMode.ByPath, path);
    }

    transpileCSharp(content): ITranspiledFile {
        return this.transpile(Languages.CSharp, TranspilationMode.ByContent, content);
    }

    transpileCSharpByPath(path): ITranspiledFile {
        return this.transpile(Languages.CSharp, TranspilationMode.ByPath, path);
    }

    getFileImports(content: string): IFileImport[] {
        this.createProgramInMemoryAndSetGlobals(content);
        return this.phpTranspiler.getFileImports(global.src);
    }

    getFileExports(content: string): IFileExport[] {
        this.createProgramInMemoryAndSetGlobals(content);
        return this.phpTranspiler.getFileExports(global.src);
    }

    setPHPPropResolution(props: string[]) {
        this.phpTranspiler.propRequiresScopeResolutionOperator = props;
    }

    setPhpUncamelCaseIdentifiers(uncamelCase: boolean) {
        this.phpTranspiler.uncamelcaseIdentifiers = uncamelCase;
    }
    
    setPythonUncamelCaseIdentifiers(uncamelCase: boolean) {
        this.pythonTranspiler.uncamelcaseIdentifiers = uncamelCase;
    }

    setPhpAsyncTranspiling(async: boolean) {
        this.phpTranspiler.asyncTranspiling = async;
    }

    setPythonAsyncTranspiling(async: boolean) {
        this.pythonTranspiler.asyncTranspiling = async;
    }

    setPythonStringLiteralReplacements(replacements): void {
        this.pythonTranspiler.StringLiteralReplacements = replacements;
    }
}   

export {
    Transpiler
};