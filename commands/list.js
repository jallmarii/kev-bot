// imports
var gd = require('../globaldata.js');

module.exports = {
    name: 'list',
    description: 'List all commands of the given category or list all categories.',
    usage: 'list!all, list!cat, list!categories, list!arnold',
    /**
     * @param {Object} methodargs
     * @param {Array.<string>} methodargs.args
     */
    execute({args}) {
        return new Promise(async (resolve, reject) => {
            // Validate inputs
            var category = args?.[0];
            var categoryDict = gd.getCategoryDict();

            // Determine the array that should be listed
            if (["categories", "cat"].includes(category)) {
                var listArr = Object.keys(categoryDict);
            } else if (["all", undefined].includes(category)) {
                var listArr = Object.keys(gd.getAudioDict());
            } else if (category in categoryDict) {
                var listArr = categoryDict[category];
            } else {
                return reject({ userResponse: `"${category}" is not a valid argument for the list command!` })
            }

            // Sort the list
            listArr.sort();

            // Finding the largest number of chars in a string of the list Array
            var largetNumOfChars = listArr.reduce((a,b) => {return Math.max(a,b.length);},0);
            if (largetNumOfChars === 0) {return reject("Couldn't get largest number of characters");}   

            // Loop over the list array and pad every string with spaces to make each string equal length
            for (let idx in listArr) {listArr[idx] += ' '.repeat(largetNumOfChars - listArr[idx].length + 2);}

            // Defines a function that splits an array into equal chunks based on the given size
            function chunk(array, size) {
                const chunkedArray = [];
                let index = 0;
                while (index < array.length) {
                    chunkedArray.push(array.slice(index, size + index));
                    index += size;
                }
                return chunkedArray;
            }
            
            // Split the list array into 4 arrays of roughly equal size (last array will be shorter potentially)
            let numCols = 4;
            const numRows = Math.ceil(listArr.length / numCols);
            colArr = chunk(listArr, numRows);

            // Loop over the rows and concat the columns together
            let response = '';
            for (let row = 0; row < numRows; row++) {
                response += colArr[0][row] + colArr[1][row] + colArr[2][row];
                response += (colArr[3]?.[row] || "") + "\n";  // last row might be undefined
            }           

            // return promise
            return resolve({ userMess: response, wrapChar: "```" });
        });
    }
};


            // // Generating the response message (by column)
            // let response = '';
            // const num_columns = 4;
            // const num_rows = Math.ceil(listArr.length / num_columns);
            // for (let i = 0; i < num_rows; i++) {
            //     for (let j = 0; j < num_columns; j++) {
            //         if (i +j*num_rows < listArr.length) {
            //             let item = listArr[i +j*num_rows];
            //             let space_str = ' '.repeat(largetNumOfChars - item.length);
            //             response += item + space_str + '  ';
            //         }    
            //     }
            //     response += '\n';
            // }