





const SEARCH_DATA = [
    {
        Alpha: 'X',
        Bravo: 'X',
    },
    {
        Alpha: 'A',
        Bravo: '1',
    },
    {
        Alpha: 'B',
        Bravo: '2',
    },
    {
        Alpha: 'Test',
        Bravo: '3',
    },
    {
        Alpha: 'Test',
        Bravo: 'Test'
    }
];

interface Pattern {
    modifier: string;
    expression: string;
}

const SEARCH_PATTERN: Pattern[] = [
    {
        modifier: '*',
        expression: 'Alpha == "X"'
    },
    {
        modifier: '1',
        expression: 'Alpha == "A" || Alpha == "B"'
    },
    {
        modifier: '1',
        expression: 'Alpha == "A" || Alpha == "B"'
    },
    {
        modifier: '*',
        expression: 'Alpha == "Test"'
    },
    {
        modifier: '1',
        expression: 'Alpha == "Test" && Bravo == "Test"'
    },
]

const patternStr = `
1 : Alpha == 'X'
1 : Alpha == 'A'
`;


export function parsePatternLine(line: string): Pattern {
    const index = line.indexOf(':');

    const modifier = line.substring(0, index).trim();
    const expression = line.substring(index + 1).trim();

    return {
        modifier,
        expression
    }
}

export function parsePatternText(text: string): Pattern[] {
    const lines = text.split('\n').filter((value) => value.trim());

    return lines.map((value) => parsePatternLine(value));
}

parsePatternText(patternStr);



export class RegexMatcher {
    regexCounter = 0;
    expandedPattern: Pattern[] = []

    constructor(private pattern: Pattern[], private searchData: Record<string, string | number>[]) {
        this.expandedPattern = this.pattern;
    }

    match() {
        // Since JavaScript doesn't support pointer arithmetic, we mimic
        // that behavior using counter variables which indicate which position
        // in the array we want to be referencing at each step in the recursion
        let outerRegexCounter = 0;
        let outerStringCounter = 0;

        const path: number[] = [];

        // Else, walk through string and check to see if string match beginning of expression at each point in string
        // This is an example of backtracking. If the regex doesn't match at this point in the string, the next
        // character in the string will be consumed and the regex will be checked again starting at that point.
        for (var i = 0; i < this.searchData.length; i++) {
            const p = this.matchHere(outerRegexCounter, outerStringCounter + i, path);
            if (p) {
                return p;
            }
        }

        // If the regex can't be matched starting at any point in the string, return false
        return undefined;
    }

    matchFunc(matcher: Pattern, value: Record<string, string | number>) {
        const keys = Object.keys(value);
        const func = new Function(...keys, `return ${matcher.expression}`)

        // console.log(matcher);

        try {
            const v = func(...keys.map((key) => value[key]));

            // console.log(matcher, value, v);

            return v;
        } catch (e) {
            return false;
        }
    }

    matchStar(starPattern: Pattern, regexCounter: number, stringCounter: number, path: number[]): number[] | undefined {
        // Lazy (non-greedy) implementation of star. Since the minimum number of characters a start can match is 0, can immediately check if regex
        // matches from this point onward, return true since the * does not need to consume any characters.
        const zeroPath = this.matchHere(regexCounter, stringCounter, [...path])
        if (zeroPath) {
            return zeroPath;
        };

        // If consuming 0 characters fails, consume one character and check, then continue consuming a character and checking if the regex pattern
        // matches until there are no more characters to consume.
        // stringCounter++;
        const pathCopy = [...path];
        while (stringCounter !== this.searchData.length && this.matchFunc(starPattern, this.searchData[stringCounter])) {
            pathCopy.push(stringCounter)
            //console.log("yes it found", starPattern);
            stringCounter++;

            const p = this.matchHere(regexCounter, stringCounter, [...pathCopy]);
            if (p) {
                return p;
            }

        }
        // If the regex pattern was never able to match return false
        return undefined;
    }

    matchHere(regexCounter: number, stringCounter: number, path: number[]): number[] | undefined {
        // If we reach the end of the regex pattern, we've found a match
        if (regexCounter === this.expandedPattern.length) {
            return path;
        }

        // Handle * case
        if (this.expandedPattern[regexCounter].modifier === '*') {
            return this.matchStar(this.expandedPattern[regexCounter], regexCounter + 1, stringCounter, [...path]);
        }

        // If we're not at the end of the string and the regular expression character is a wildcard or the same as the string character, continue recursing
        if (stringCounter !== this.searchData.length && this.matchFunc(this.expandedPattern[regexCounter], this.searchData[stringCounter])) {// this.expandedPattern[regexCounter].expression === this.searchData[stringCounter]) {
            return this.matchHere(regexCounter + 1, stringCounter + 1, [...path, stringCounter]);
        }

        // If all else fails, return false. No match.
        return undefined;
    }
}

console.log(new RegexMatcher(parsePatternText(patternStr), SEARCH_DATA).match());