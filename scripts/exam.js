const colors = ['blue darken-2', 'blue darken-1',
    'blue', 'blue lighten-1', 'blue lighten-2', 'blue lighten-3', 'blue lighten-4', 'blue lighten-5', 'light-blue lighten-5',
    'light-blue lighten-4', 'light-blue lighten-3', 'light-blue lighten-2', 'light-blue lighten-1', 'light-blue'];
auth.onAuthStateChanged(user => {
    if (user) {

    } else {
        window.location = "/tracker-app/";
    }
})

document.addEventListener('DOMContentLoaded', () => {
    getData();
});

const getData = () => {
    fetch('https://todoapp-abhik.netlify.app/api/get-all-examtopics')
        .then(response => response.json())
        .then(data => {
            //console.log(data)
            setupExamList(data);
        });
    fetch('https://todoapp-abhik.netlify.app/api/get-all-exams')
        .then(response => response.json())
        .then(data => {
            //console.log(data)
            setupExams(data);
        });
}

const updateData = (id, status) => {
    fetch(`https://todoapp-abhik.netlify.app/api/update-examtopics-status?id=${id}&status=${status}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                getData();
            }
        });
}

const setupExams = (data) => {
    var table = document.getElementById('table-body-exam');
    if(data.length > 0){
        let html = '';
        let index = 0;
        data.forEach( element => {
            index++;
            const tr = `
            <tr>
            <td>${index}</td>
            <td>${element.name}</td>
            <td>${element.remainingDays}</td>
            <td>${element.totalHoursPlanned}</td>
            <td>${element.noOfTopics}</td>
            <td>${element.noOfTopicsCompleted}</td>
            <td>${element.noOfTopicsNotCompleted}</td>
            </tr>
            `;
            html += tr;
        })
        table.innerHTML = html
    }
}

$(document).ready(function () {
    $('select').formSelect();

});
const setupExamList = (data) => {
    var table = document.getElementById('table-body');
    var categorySection = document.getElementById('categories-actual-planned');
    if (data.length > 0) {
        let html = '';
        let index = 0;
        var dataArr = [];
        data.forEach(element => {
            index++;
            const tr = `
            <tr>
            <td>${index}</td>
            <td>${element.fields.ExamTopicName}</td>
            <td>${element.fields.ExamName[0]}</td>
            <td>${element.fields.ExamPlannedDate[0]}</td>
            <td>${element.fields.ExpectedTime ? element.fields.ExpectedTime : ''}</td>
            <td id=${element.id}>
                <select class="browser-default"  id="select-status" >
                    <option value="" disabled selected>${element.fields.Status}</option>
                    <option value="${element.id}|Not Started">Not Started</option>
                    <option value="${element.id}|Planning">Planning</option>
                    <option value="${element.id}|In Progress">In Progress</option>
                    <option value="${element.id}|Deferred">Deferred</option>
                    <option value="${element.id}|Test">Test</option>
                    <option value="${element.id}|Completed">Completed</option>
                </select>
            
            </td>
            </tr>
        `;
            html += tr;
            dataArr.push({
                id: element.id,
                status: element.fields.Status
            })

        });
        const groupedData = groupBy('status', dataArr);
        const categoryArr = Object.keys(groupedData);
        const stat = [];
        var count = 0;
        categoryArr.forEach(category => {
            groupedData[category].map(unit => {
                count++
            })
            stat.push({
                category: category,
                count: count
            });
            count = 0;
        });
        console.log(stat)

        table.innerHTML = html

        html = '';
        stat.map((block, i) => {
            html += `
            <span class="${colors[i + 4]}" style="padding:10px;">${block.category}: ${block.count}</span>
            `
        });
        categorySection.innerHTML = html;
        const selectStatus = document.querySelectorAll('#select-status');
        selectStatus.forEach(element => {
            element.addEventListener('change', (e) => {
                console.log('Selected Element value - ', e.target.value)
                updateData(e.target.value.split("|")[0], e.target.value.split("|")[1])
            });
        })
    }

}

const groupBy = (key, arr) => arr.reduce((cache, task) =>
({
    ...cache, [task[key]]:
        task[key] in cache
            ? cache[task[key]].concat(task)
            : [task]
}), {})