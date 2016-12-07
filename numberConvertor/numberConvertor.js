var binary, // base 2
    octal, // base 8
    decimal, // base 10
    hex, // base 16
    roman;
// chinese numerals

//wikipedia.org/wiki/List_of_numeral_systems



var base2set = ['0', '1'],
    base8set = ['0', '1', '2', '3', '4', '5', '6', '7'],
    base10set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    base16set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    baseSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];


// call stack size may exceed max for really big numbers because function uses recursion
function convertFromBase10(number, base) {
    var r = number % base; // get the mod/remainder
    //console.log(r,number);
    if (r === number) {
        return baseSet[r];
    } else {
        return convertFromBase10((number - r) / base, base) + baseSet[r];
    }
}

// call stack size may exceed max for really big numbers because function uses recursion
function convertToBase10(number, base) {
    //get chars of number
    var digits = [1, 0, 1, 1]; // get digits from number '1011' --> [1,0,1,1] && '8C' --> [8,12]
    var base10 = 0,
        i = digits.length - 1;
    digits.forEach(function (digit) {
        base10 += digit * Math.pow(base, i);
        i = i - 1;
        //i--; //jslint doesn't like
    });
    return base10;
}

console.log(convertFromBase10(5, 2));
console.log(convertFromBase10(140, 8));
console.log(convertFromBase10(55, 10));
console.log(convertFromBase10(110, 16));

console.log("*", convertToBase10('101', 2));
//console.log(convertToBase10('214', 8));
//console.log(convertToBase10('55', 10));
//console.log(convertToBase10('6E', 16));