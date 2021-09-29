let defaultWidth = 415;
let thresholdSize = 437;

let sketchHolder = document.getElementById("sketch-holder") || undefined;
let canvas = null;
let sudokuInstance;
let renderer;

class SudokuGenerator {
    constructor(size) {
        this.size = size;
        this.answerArray = [];
        this.sudokuQuestion = [];
        this.numOfChoice = [];
        this.fixedCoordinate = [];
        this.mouseOverAnyNumpad = false;
        this.selectedNum = '';
        this.lightBlue = '#33b5e5';
        this.sketch = (s) => {
            let isModifyEnabled = false;
            let modifyX;
            let modifyY;
            let dragX;
            let dragY;
            let dragLocked;
            s.preload = () => {
                this.answerArray = this.generateNewSudoku(s);
                this.sudokuQuestion = this.answerArray.map(function (arr) {
                    return arr.slice();
                });
                this.createQuestion2(s);
            };
            s.setup = () => {
                renderer = s.createCanvas(this.size, this.size + (this.size / 7));
                s.windowResized();
            };
            s.windowResized = () => {
                sketchHolder.innerHTML = "";
                if (window.visualViewport.width < thresholdSize) {
                    this.size = window.visualViewport.width * 92 / 100;
                } else {
                    this.size = defaultWidth;
                }
                s.resizeCanvas(this.size, this.size + (this.size / 7));
                renderer.parent(sketchHolder);
            }
            s.draw = () => {
                this.createSudokuFrame(s);
                this.enableGreyHover(s, isModifyEnabled, modifyX, modifyY);
                this.enableNumpadInput(s);
                // while mouse drag
                if (dragLocked) {
                    s.fill(88);
                    s.text(this.selectedNum, dragX, dragY);
                }
                this.showSudoku(s);
            };
            s.mousePressed = (() => {
                let boxSize = this.size / 9;
                let numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                for (let i = boxSize / 2, j = 0; i <= this.size; i += boxSize, j++) {
                    const disX = i - s.mouseX;
                    const disY = this.size + (this.size / 13) - s.mouseY;
                    const diameter = this.size / 10;
                    let mouseOverNumpad = s.sqrt(s.sq(disX) + s.sq(disY)) < diameter / 2;
                    if (mouseOverNumpad && isModifyEnabled) {
                        this.sudokuQuestion[modifyY][modifyX] = "" + numberList[j];
                        isModifyEnabled = false;
                        this.checkResult();
                        break;
                    }
                }
                if (s.mouseX > 0 && s.mouseX < this.size && s.mouseY > 0 && s.mouseY < this.size) {
                    isModifyEnabled = false;
                    modifyX = Math.floor(s.mouseX / boxSize);
                    modifyY = Math.floor(s.mouseY / boxSize);
                    if (!this.isFixedCoordinate(modifyX, modifyY)) {
                        isModifyEnabled = true;
                        this.hideIfAllowed(modifyY, modifyX);
                        this.sudokuQuestion[modifyY][modifyX] = '';
                    }
                }
            });
            s.keyTyped = () => {
                if (s.key === 'c') {
                    this.sudokuQuestion[modifyY][modifyX] = '';
                    this.fixedCoordinate = this.fixedCoordinate.filter((x) => !(x[0] === modifyY && x[1] === modifyX));
                }
                else {
                    let num = s.key;
                    if (isModifyEnabled && this.numOfChoice.includes(num)) {
                        this.sudokuQuestion[modifyY][modifyX] = num;
                        isModifyEnabled = false;
                        this.checkResult();
                    }
                }
                // uncomment to prevent any default behavior
                return false;
            };
            s.mouseDragged = ((event) => {
                dragX = s.mouseX;
                dragY = s.mouseY;
                if (this.mouseOverAnyNumpad) {
                    dragLocked = true;
                }
            });
            s.mouseReleased = ((event) => {
                if (dragLocked) {
                    isModifyEnabled = false;
                    if (s.mouseX > 0 && s.mouseX < this.size && s.mouseY > 0 && s.mouseY < this.size) {
                        let boxSize = this.size / 9;
                        modifyX = Math.floor(s.mouseX / boxSize);
                        modifyY = Math.floor(s.mouseY / boxSize);
                        if (!this.isFixedCoordinate(modifyX, modifyY)) {
                            isModifyEnabled = true;
                            this.hideIfAllowed(modifyY, modifyX);
                            this.sudokuQuestion[modifyY][modifyX] = this.selectedNum;
                            isModifyEnabled = false;
                            this.checkResult();
                        }
                    }
                }
                dragLocked = false;
            });
        };
        
    }
    generateNewSudoku(s) {
        // initialize array
        this.answerArray = [];
        for (let i = 0; i < 9; i++) {
            this.answerArray[i] = [];
            for (let j = 0; j < 9; j++)
                this.answerArray[i][j] = '-';
        }
        // start populating
        let positionHistory = [];
        let availablePositionHistory = [];
        let count = 0;
        let isBackTracking = false;
        // initiate and randomize 1-9
        // TODO
        this.numOfChoice = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        for (let h = 0; h < this.numOfChoice.length; h++) {
            let numberToFill = this.numOfChoice[h];
            let i = 0;
            if (isBackTracking)
                i = 8;
            else {
                positionHistory[h] = [];
                availablePositionHistory[h] = [];
            }
            for (; i < this.answerArray.length; i++) {
                if (count > 2000)
                    return this.answerArray;
                let availablePosition = [];
                if (isBackTracking) {
                    availablePosition = availablePositionHistory[h][i];
                }
                else {
                    for (let j = 0; j < this.answerArray[i].length; j++) {
                        if (this.answerArray[i][j] === '-' && this.fitSudokuRules(numberToFill, i, j))
                            availablePosition.push(j);
                    }
                    availablePositionHistory[h][i] = availablePosition;
                }
                if (availablePosition.length === 0) {
                    if (i === 0) {
                        // 1. erase previous numberToFill from last row
                        let index = this.answerArray[8].indexOf(this.numOfChoice[h - 1]);
                        if (index !== -1) {
                            this.answerArray[8][index] = '-';
                        }
                        // 2.pop previousPosition out from positionHistory
                        let previousPosition = positionHistory[h - 1].pop();
                        // 3.eliminate wrong path
                        availablePositionHistory[h - 1][8] = availablePositionHistory[h - 1][8].filter((e) => e !== previousPosition);
                        // 4. backtracking = on
                        isBackTracking = true;
                        h -= 2;
                        count++;
                        break;
                    }
                    // 1.erase numberToFill from previous row
                    let index = this.answerArray[i - 1].indexOf(numberToFill);
                    if (index !== -1) {
                        this.answerArray[i - 1][index] = '-';
                    }
                    // 2.pop previousPosition out from positionHistory
                    let previousPosition = positionHistory[h].pop();
                    // 3.eliminate wrong path
                    availablePositionHistory[h][i - 1] = availablePositionHistory[h][i - 1].filter((e) => e !== previousPosition);
                    // 4. backtracking = on
                    isBackTracking = true;
                    i -= 2;
                    count++;
                }
                else {
                    let positionChoice = s.random(availablePosition);
                    this.answerArray[i][positionChoice] = numberToFill;
                    positionHistory[h].push(positionChoice);
                    isBackTracking = false;
                }
            }
        }
        return this.answerArray;
    }
    createQuestion1(s) {
        this.sudokuQuestion.forEach((array, indexX) => {
            array.forEach((element, indexY) => {
                if (element !== '')
                    this.fixedCoordinate.push([indexX, indexY]);
            });
        });
        // test 0,0
        let currentPosition = [0, 0];
        let isGoingHori = true;
        let excludePositionList = [];
        let positionList = [];
        for (let i = 0; i < 1000; i++) {
            if (this.hideIfAllowed(currentPosition[0], currentPosition[1])) {
                this.fixedCoordinate = this.fixedCoordinate.filter(x => !(x[0] === currentPosition[0] && x[1] === currentPosition[1]));
                if (isGoingHori) {
                    positionList = this.findPositionCandidate(currentPosition[0], 'horizontal');
                    isGoingHori = false;
                }
                else {
                    positionList = this.findPositionCandidate(currentPosition[1], 'vertical');
                    isGoingHori = true;
                }
                positionList = positionList.filter(x => {
                    return !excludePositionList.some(y => y[0] === x[0] && y[1] === x[1]);
                });
                if (positionList.length > 0) {
                    currentPosition = s.random(positionList);
                }
                else {
                    // console.log(i);
                    break;
                }
            }
            else {
                excludePositionList.push(currentPosition);
                if (isGoingHori) {
                    positionList = this.findPositionCandidate(currentPosition[1], 'vertical');
                }
                else {
                    positionList = this.findPositionCandidate(currentPosition[0], 'horizontal');
                }
                positionList = positionList.filter(x => {
                    return !excludePositionList.some(y => y[0] === x[0] && y[1] === x[1]);
                });
                if (positionList.length > 0)
                    currentPosition = s.random(positionList);
                else {
                    // console.log(i);
                    break;
                }
            }
        }
    }
    createQuestion2(s) {
        let rowToChooseForEachNum = [];
        // for each numOfChoice, random choose row to hide x9
        for (let h = 0; h < this.numOfChoice.length; h++) {
            let rowToChoose = this.numOfChoice.map(x => +(x) - 1);
            rowToChooseForEachNum.push(rowToChoose);
            let numToHide = this.numOfChoice[h];
            // 1. get random coordinate x8 7=easy
            for (let i = 0; i < 8; i++) {
                let randomRow = s.random(rowToChoose);
                rowToChoose = rowToChoose.filter(x => x !== randomRow);
                let indexY = this.sudokuQuestion[randomRow].findIndex((x) => x === numToHide);
                this.hideIfAllowed(randomRow, indexY);
            }
        }
        this.sudokuQuestion.forEach((array, indexX) => {
            array.forEach((element, indexY) => {
                if (element !== '')
                    this.fixedCoordinate.push([indexX, indexY]);
            });
        });
    }
    showSudoku(s) {
        s.fill(0);
        let yAxisPoint = this.size / 12;
        s.textSize(this.size / 15.4); // 35 in 540
        for (let i = 0; i < 9; i++) {
            let xAxisPoint = this.size / 27; // 20
            for (let j = 0; j < 9; j++) {
                if (this.isFixedCoordinate(j, i)) {
                    s.fill(0);
                    s.textStyle(s.BOLDITALIC);
                }
                else {
                    s.fill(88);
                    s.textStyle(s.NORMAL);
                }
                s.text(this.sudokuQuestion[i][j], xAxisPoint, yAxisPoint);
                xAxisPoint += this.size / 9;
            }
            yAxisPoint += this.size / 9;
        }
    }
    resetQuestion() {
        this.sudokuQuestion = this.answerArray.map(function (arr) {
            return arr.slice();
        });
        for (let i = 0; i < this.sudokuQuestion.length; i++) {
            for (let j = 0; j < this.sudokuQuestion.length; j++) {
                if (!this.isFixedCoordinate(i, j))
                    this.sudokuQuestion[j][i] = '';
            }
        }
    }
    showAnswer() {
        this.sudokuQuestion = this.answerArray.map(function (arr) {
            return arr.slice();
        });
    }
    hintNextStep() {
        for (let i = 0; i < this.sudokuQuestion.length; i++) {
            for (let j = 0; j < this.sudokuQuestion.length; j++) {
                if (this.sudokuQuestion[i][j] === '') {
                    let sss = this.findPossibilityByCoor(i, j);
                    if ((sss === null || sss === void 0 ? void 0 : sss.length) === 1)
                        this.sudokuQuestion[i][j] = sss[0];
                }
            }
        }
    }
    fitSudokuRules(randomNum, xPoint, yPoint) {
        if (this.answerArray[xPoint].some(x => x === randomNum))
            return false;
        let verticalArray = [];
        for (let i = 0; i < xPoint; i++) {
            verticalArray.push(this.answerArray[i][yPoint]);
        }
        if (verticalArray.length && verticalArray.some(x => x === randomNum))
            return false;
        let boxArray = [];
        let i = Math.floor(xPoint / 3) * 3;
        let xEnd = i + 2;
        for (; i <= xEnd; i++) {
            let j = Math.floor(yPoint / 3) * 3;
            let yEnd = j + 2;
            for (; j <= yEnd; j++) {
                if (this.answerArray[i] && this.answerArray[i][j])
                    boxArray.push(this.answerArray[i][j]);
            }
        }
        if (boxArray.length && boxArray.some(x => x === randomNum))
            return false;
        return true;
    }
    findPositionCandidate(index, axis) {
        let positionCandidates = [];
        if (axis === 'horizontal') {
            this.sudokuQuestion[index].forEach((x, indexY) => {
                if (x !== '')
                    positionCandidates.push([index, indexY]);
            });
        }
        else if (axis === 'vertical') {
            for (let i = 0; i < 9; i++) {
                if (this.sudokuQuestion[i][index] !== '')
                    positionCandidates.push([i, index]);
            }
        }
        return positionCandidates;
    }
    hideIfAllowed(randomX, randomY) {
        var _a;
        let numberToHide = this.sudokuQuestion[randomX][randomY];
        this.sudokuQuestion[randomX][randomY] = '';
        // 1.0 hide if itself is the only choice
        if (((_a = this.findPossibilityByCoor(randomX, randomY)) === null || _a === void 0 ? void 0 : _a.length) === 1)
            return true;
        // 1.1 horizontal, for each blank, get their available choices, put in one array
        let horizontalPossibility = [];
        this.sudokuQuestion[randomX].forEach((element, index) => {
            if (element === '')
                horizontalPossibility.push(this.findPossibilityByCoor(randomX, index));
        });
        // console.log(horizontalPossibility);
        let test1 = horizontalPossibility.slice(0);
        this.filterPossibilities(test1);
        this.filterPossibilities(test1);
        // console.log(test1);
        if (!this.appearMoreThanOnce(test1.flat(), numberToHide))
            return true;
        // 1.2 vertical, for each blank, get their available choices, put in one array
        let verticalPossibility = [];
        for (let i = 0; i < 9; i++) {
            if (this.sudokuQuestion[i][randomY] === '')
                verticalPossibility.push(this.findPossibilityByCoor(i, randomY));
        }
        // console.log(verticalPossibility);
        let test2 = verticalPossibility.slice(0);
        this.filterPossibilities(test2);
        this.filterPossibilities(test2);
        // console.log(test2);
        if (!this.appearMoreThanOnce(test2.flat(), numberToHide))
            return true;
        // 1.3 box, for each blank, get their available choices, put in one array
        let boxPossibility = [];
        let i = Math.floor(randomX / 3) * 3;
        let xEnd = i + 2;
        for (; i <= xEnd; i++) {
            let j = Math.floor(randomY / 3) * 3;
            let yEnd = j + 2;
            for (; j <= yEnd; j++) {
                if (this.sudokuQuestion[i][j] === '')
                    boxPossibility.push(this.findPossibilityByCoor(i, j));
            }
        }
        // console.log(boxPossibility);
        let test3 = boxPossibility.slice(0);
        this.filterPossibilities(test3);
        this.filterPossibilities(test3);
        // console.log(test3);
        if (!this.appearMoreThanOnce(test3.flat(), numberToHide))
            return true;
        this.sudokuQuestion[randomX][randomY] = numberToHide;
        return false;
    }
    findPossibilityByCoor(xCoor, yCoor) {
        var _a;
        let choicesArray = [];
        // 1.1 horizontal choices
        let horizontalChoices = this.numOfChoice.filter(x => !this.sudokuQuestion[xCoor].includes(x));
        choicesArray.push(horizontalChoices);
        // 1.2 vertical choices
        let verticalArray = [];
        for (let i = 0; i < 9; i++) {
            verticalArray.push(this.sudokuQuestion[i][yCoor]);
        }
        let verticalChoices = this.numOfChoice.filter(x => !verticalArray.includes(x));
        choicesArray.push(verticalChoices);
        // 1.3 box choices
        let boxArray = [];
        let i = Math.floor(xCoor / 3) * 3;
        let xEnd = i + 2;
        for (; i <= xEnd; i++) {
            let j = Math.floor(yCoor / 3) * 3;
            let yEnd = j + 2;
            for (; j <= yEnd; j++) {
                if (this.sudokuQuestion[i] && this.sudokuQuestion[i][j])
                    boxArray.push(this.sudokuQuestion[i][j]);
            }
        }
        let boxChoices = this.numOfChoice.filter(x => !boxArray.includes(x));
        choicesArray.push(boxChoices);
        // return an array that have common element
        let result = (_a = choicesArray.shift()) === null || _a === void 0 ? void 0 : _a.filter(function (v) {
            return choicesArray.every(function (a) {
                return a.indexOf(v) !== -1;
            });
        });
        // console.log(result);
        return result;
    }
    // if one, cancel, if 2 same cancel 2 num, if 3 same cancel 3 num
    filterPossibilities(possiblityArray) {
        let theUnique = [];
        possiblityArray.forEach(x => {
            if (x.length === 1)
                theUnique.push(x[0]);
        });
        // filter theUnique
        for (let i = 0; i < possiblityArray.length; i++) {
            if (possiblityArray[i].length > 1)
                possiblityArray[i] = possiblityArray[i].filter((y) => !theUnique.includes(y));
        }
        ;
        let theTwin = [];
        for (let i = 0; i < possiblityArray.length; i++) {
            if (possiblityArray[i].length === 2) {
                for (let j = i + 1; j < possiblityArray.length; j++) {
                    if (this.arraysEqual(possiblityArray[j], possiblityArray[i])) {
                        theTwin.push(possiblityArray[i]);
                    }
                }
            }
        }
        for (let i = 0; i < possiblityArray.length; i++) {
            for (let j = 0; j < theTwin.length; j++) {
                if (!this.arraysEqual(possiblityArray[i], theTwin[j])) {
                    possiblityArray[i] = possiblityArray[i].filter((y) => {
                        if (theTwin[j].includes(y))
                            return false;
                        return true;
                    });
                }
            }
        }
        ;
        let theTriplet = [];
        for (let i = 0; i < possiblityArray.length; i++) {
            if (possiblityArray[i].length === 3) {
                for (let j = i + 1; j < possiblityArray.length; j++) {
                    if (this.arraysEqual(possiblityArray[j], possiblityArray[i])) {
                        for (let k = j + 1; k < possiblityArray.length; k++) {
                            if (this.arraysEqual(possiblityArray[k], possiblityArray[j])) {
                                theTriplet.push(possiblityArray[i]);
                            }
                        }
                    }
                }
            }
        }
        for (let i = 0; i < possiblityArray.length; i++) {
            for (let j = 0; j < theTriplet.length; j++) {
                if (!this.arraysEqual(possiblityArray[i], theTriplet[j])) {
                    possiblityArray[i] = possiblityArray[i].filter((y) => {
                        if (theTriplet[j].includes(y))
                            return false;
                        return true;
                    });
                }
            }
        }
        ;
    }
    isFixedCoordinate(axisX, axisY) {
        for (let i = 0; i < this.fixedCoordinate.length; i++) {
            if (this.fixedCoordinate[i][0] === axisY && this.fixedCoordinate[i][1] === axisX)
                return true;
        }
        return false;
    }
    createSudokuFrame(s) {
        s.background(255);
        s.fill(0);
        let xAxisPoint = 0;
        let yAxisPoint = 0;
        for (let i = 0; i < 10; i++) {
            if (i % 3 === 0)
                s.strokeWeight(2);
            else
                s.strokeWeight(1);
            s.line(xAxisPoint, 0, xAxisPoint, this.size);
            s.line(0, yAxisPoint, this.size, yAxisPoint);
            xAxisPoint += this.size / 9;
            yAxisPoint += this.size / 9;
        }
    }
    enableGreyHover(s, isModifyEnabled, modifyX, modifyY) {
        s.strokeWeight(1);
        s.fill(225);
        let boxSize = this.size / 9;
        let axisX = Math.floor(s.mouseX / boxSize);
        let axisY = Math.floor(s.mouseY / boxSize);
        for (let i = 0; i <= this.size; i += boxSize) {
            for (let j = 0; j <= this.size; j += boxSize) {
                if (s.mouseX < this.size && s.mouseY < this.size) {
                    if ((s.mouseX > i && s.mouseX < i + boxSize) && (s.mouseY > j && s.mouseY < j + boxSize)) {
                        if (!this.isFixedCoordinate(axisX, axisY))
                            s.square(i, j, boxSize);
                    }
                }
            }
        }
        if (isModifyEnabled) {
            // s.strokeWeight(0);
            s.fill(this.lightBlue);
            s.square(modifyX * boxSize, modifyY * boxSize, boxSize);
        }
    }
    enableNumpadInput(s) {
        let numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let boxSize = this.size / 9;
        s.textStyle(s.BOLDITALIC);
        s.strokeWeight(0);
        this.mouseOverAnyNumpad = false;
        for (let i = boxSize / 2, j = 0; i <= this.size; i += boxSize, j++) {
            const disX = i - s.mouseX;
            const disY = this.size + (this.size / 13) - s.mouseY;
            const diameter = this.size / 10;
            let mouseOverNumpad = s.sqrt(s.sq(disX) + s.sq(disY)) < diameter / 2;
            if (mouseOverNumpad) {
                this.mouseOverAnyNumpad = true;
                this.selectedNum = "" + numberList[j];
                s.fill(225);
            }
            else {
                s.fill(this.lightBlue);
            }
            s.ellipse(i, this.size + (this.size / 13), this.size / 10);
            s.fill(255);
            s.text(numberList[j], i - (this.size / 52), this.size + (this.size / 10));
        }
    }
    checkResult() {
        let sudokuComplete = true;
        let allBoxesFilled = true;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (!this.numOfChoice.includes(this.sudokuQuestion[i][j]))
                    allBoxesFilled = false;
                if (this.sudokuQuestion[i][j] !== this.answerArray[i][j])
                    sudokuComplete = false;
            }
        }
        if (allBoxesFilled && sudokuComplete)
            showResultModal(true);
        else if (allBoxesFilled)
            showResultModal(false);
    }
    appearMoreThanOnce(arr, element) {
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === element)
                count++;
            if (count > 1)
                return true;
        }
        return false;
    }
    arraysEqual(arr1, arr2) {
        if (arr1 instanceof Array && arr2 instanceof Array) {
            if (arr1.length != arr2.length)
                return false;
            for (var i = 0; i < arr1.length; i++)
                if (!this.arraysEqual(arr1[i], arr2[i]))
                    return false;
            return true;
        }
        else {
            return arr1 == arr2;
        }
    }
}


sudokuInstance = new SudokuGenerator(defaultWidth);
canvas = new p5(sudokuInstance.sketch, sketchHolder);

function genNewQuestion() {
    if (canvas) {
        canvas.remove();
        canvas = null;
    }
    sketchHolder.innerHTML = "";
    sudokuInstance = null;
    sudokuInstance = new SudokuGenerator(defaultWidth);
    canvas = new p5(sudokuInstance.sketch, sketchHolder);
}
function resetQuestion() {
    sudokuInstance.resetQuestion();
}
function showAnswer() {
    sudokuInstance.showAnswer();
}
function hintNextStep() {
    sudokuInstance.hintNextStep();
}
function showResultModal(success) {
    let title = 'Sorry, wrong answer...';
    let body = '';
    $('#sudokuCompleteModalBody').hide();
    $('#saveResultButton').hide();
    if (success) {
        title = 'Congratulations! You\'ve done it!';
        // $('#sudokuCompleteModalBody').show();
        // $('#saveResultButton').show();
    }
    $('#sudokuCompleteModalTitle').html(title);
    // $('#sudokuCompleteModalBody').html(body);
    setTimeout(function(){ $('#sudokuCompleteModal').modal('show'); }, 100);
}