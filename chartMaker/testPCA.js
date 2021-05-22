const PCA = require('pca-js')

module.exports = (data) => {
    Array.prototype.contains = (v) => {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === v) return true;
        }
        return false;
    };

    Array.prototype.unique = () => {
        var arr = [];
        for (var i = 0; i < this.length; i++) {
            if (!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    }


    var duplicates = [1, 3, 4, 2, 1, 2, 3, 8];
    var uniques = duplicates.unique(); // result = [1,3,4,2,8]
    let keys = Object.keys(data[0])
    let nominalKeys = []
    for (let i = 0; i < keys.length; i++) {
        if (isNaN(data[0][keys[i]]) && keys[i] !== 'tableData') {
            nominalKeys.push(keys[i])
        }
    }

    let testPCAData = []

    let tmp = [];
    for (let j = 0; j < 5; j++) {
        tmp.push(data[j]['math score'])
    }
    let tmp2 = []
    for (let j = 0; j < 5; j++) {
        tmp2.push(data[j]['reading score'])
    }

    let tmp3 = []
    for (let j = 0; j < 5; j++) {
        tmp3.push(data[j]['writing score'])
    }
    // testPCAData.push(tmp)
    testPCAData.push(tmp2)
    testPCAData.push(tmp3)




    // console.log(testPCAData)
    let vectors = PCA.getEigenVectors(testPCAData)
    console.log(vectors)
}