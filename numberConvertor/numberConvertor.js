/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var binary, // base 2
    octal, // base 8
    decimal, // base 10
    hex, // base 16
    roman,
    base2 = document.getElementById('base2'),
    base3 = document.getElementById('base3'),
    base4 = document.getElementById('base4'),
    base5 = document.getElementById('base5'),
    base6 = document.getElementById('base6'),
    base8 = document.getElementById('base8'),
    base10 = document.getElementById('base10'),
    base11 = document.getElementById('base11'),
    base12 = document.getElementById('base12'),
    base13 = document.getElementById('base13'),
    base14 = document.getElementById('base14'),
    base15 = document.getElementById('base15'),
    base16 = document.getElementById('base16'),
    base20 = document.getElementById('base20'),
    base24 = document.getElementById('base24'),
    base26 = document.getElementById('base26'),
    roman = document.getElementById('roman');


    
// chinese numerals

//wikipedia.org/wiki/List_of_numeral_systems



var base2set = ['0', '1'],
    base8set = ['0', '1', '2', '3', '4', '5', '6', '7'],
    base10set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    base16set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    baseSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    //base13set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '&#8586', '&#8587'], // rotated2, rotated3
    base12set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '\u218a', '\u218b'], // rotated2, rotated3

    romanSet = { // line on top ( ̄ ) means *1000
        1: 'I',
        4: 'IV',
        5: 'V',
        9: 'IX',
        10: 'X',
        40: 'XL',
        50: 'L',
        90: 'XC',
        100: 'C',
        400: 'CD',
        500: 'D',
        900: 'CM',
        1000: 'M',
        4000: 'MV&#772', // MV̄
        5000: 'V&#772', // V̄
        9000: 'MX&#772', // MX̄
        10000: 'X&#772', // X̄
        40000: 'X&#772L&#772', // X̄L̄
        50000: 'L&#772', // L̄
        90000: 'X&#772C&#772', // X̄C̄
        100000: 'C&#772', // C̄
        400000: 'C&#772D&#772', // C̄D̄
        500000: 'D&#772', // D̄
        900000: 'C&#772M&#772', // C̄M̄
        1000000: 'M&#772' // M̄
    };

// call stack size may exceed max for really big numbers because function uses recursion// TODO change to while loop
function covertToRoman(number) {
    "use strict";
    number = parseFloat(number);
    if (number === 0) { return ""; } // end recursion when number is 0
    var keyset = Object.keys(romanSet),
        key = Math.max.apply(Math, keyset.filter(function (k) {return k <= number; })); // largest key that is less than number
    return romanSet[key] + covertToRoman(number - key);
}

// call stack size may exceed max for really big numbers because function uses recursion// TODO change to while loop
function convertFromBase10(number, base) {
    "use strict";
    var digitSet = baseSet; // the set that the digits belong to
    if (base === 12) {
        digitSet = base12set;
    }
    var r = number % base; // get the mod/remainder
    if (r === number) {
        return digitSet[r];
    } else {
        return convertFromBase10((number - r) / base, base) + digitSet[r];
    }
}

// call stack size may exceed max for really big numbers because function uses recursion
function convertToBase10(number, base) {
    "use strict";
    var digits = number.split(''), // get digits from number '1011' --> [1,0,1,1] && '8C' --> [8,12]
        digitSet = baseSet, // the set that the digits belong to
        base10number = 0,
        i = digits.length - 1;
    if (number === 12) {
        digitSet = base12set;
    }
    
    digits.forEach(function (digit) {
        base10number += digitSet.indexOf(digit) * Math.pow(base, i);
        i -= 1;
    });
    return base10number;
}

function recalculate() {
    "use strict";
    var base10number = base10.value;
    
    base2.value = convertFromBase10(base10number, 2);
    base3.value = convertFromBase10(base10number, 3);
    base4.value = convertFromBase10(base10number, 4);
    base5.value = convertFromBase10(base10number, 5);
    base6.value = convertFromBase10(base10number, 6);
    base8.value = convertFromBase10(base10number, 8);
    //base10.value = convertFromBase10(base10number, 10);
    base11.value = convertFromBase10(base10number, 11);
    base12.value = convertFromBase10(base10number, 12); // other digit sets.. https://en.wikipedia.org/wiki/Duodecimal
    base13.value = convertFromBase10(base10number, 13);
    base14.value = convertFromBase10(base10number, 14);
    base15.value = convertFromBase10(base10number, 15);
    base16.value = convertFromBase10(base10number, 16);
    //base20.value = convertFromBase10(base10number, 20);
    //base24.value = convertFromBase10(base10number, 24);
    //base26.value = convertFromBase10(base10number, 26);
    roman.value = covertToRoman(base10number, 16);

    console.log(convertFromBase10(base10number, 13));
}

console.log(convertFromBase10(5, 2));
console.log(convertFromBase10(140, 8));
console.log(convertFromBase10(55, 10));
console.log(convertFromBase10(110, 16));

console.log("*", convertToBase10('101', 2));
console.log("*", convertToBase10('214', 8));
console.log("*", convertToBase10('55', 10));
console.log("*", convertToBase10('6E', 16));
console.log("*", convertToBase10('1C4', 16));


console.log("R", covertToRoman(1));
console.log("R", covertToRoman(4));
console.log("R", covertToRoman(943));
console.log("R", covertToRoman(10));
console.log("R", covertToRoman(124900));