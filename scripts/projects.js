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
    fetch('https://todoapp-abhik.netlify.app/api/get-all-projects')
        .then(response => response.json())
        .then(data => {
            //console.log(data)
            setupBooksList(data);
        });
}

const updateData = (id, status) => {
    fetch(`https://todoapp-abhik.netlify.app/api/update-project-status?id=${id}&status=${status}`)
        .then(response => response.json())
        .then(data => {
            if(data){
                getData();
            }
        });
}

$(document).ready(function(){
    $('select').formSelect();

  });
const setupBooksList = (data) => {
    var table = document.getElementById('table-body');
    var categorySection = document.getElementById('categories-actual-planned');
    var projectCategorySection = document.getElementById('categories');
    if (data.length > 0) {
        let html = '';
        let index = 0;
        var dataArr = [];
        data.forEach(element => {
            index++;
            const tr = `
            <tr>
            <td>${index}</td>
            <td>${element.fields.Name}</td>
            <td>${element.fields.Category}</td>
            <td>${element.fields.StartDate ? element.fields.StartDate : ''}</td>
            <td>${element.fields.EndDate ? element.fields.EndDate : ''}</td>
            <td>${element.fields.PlannedNoOfDays ? element.fields.PlannedNoOfDays : ''}</td>
            <td id=${element.id}>
                <select class="browser-default"  id="select-status" >
                    <option value="" disabled selected>${element.fields.Status}</option>
                    <option value="${element.id}|Not Started">Not Started</option>
                    <option value="${element.id}|Planning">Planning</option>
                    <option value="${element.id}|Coding">Coding</option>
                    <option value="${element.id}|Documentation">Documentation</option>
                    <option value="${element.id}|Complete">Complete</option>
                </select>
            
            </td>
            </tr>
        `;
            html += tr;
            dataArr.push({
                id: element.id,
                status: element.fields.Status,
                category: element.fields.Category
            })
            
        });
        var groupedData = groupBy('status', dataArr);
        var categoryArr = Object.keys(groupedData);
        var stat = [];
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
            <span class="${colors[i+4]}" style="padding:10px;">${block.category}: ${block.count}</span>
            `
        });
        
        categorySection.innerHTML = html;


        /* Category  */
        groupedData = groupBy('category', dataArr);
        categoryArr = Object.keys(groupedData);
        stat = [];
        count = 0;
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
        html = '';
        stat.map((block, i) => {
            html += `
            <span class="${colors[i+4]}" style="padding:10px;">${block.category}: ${block.count}</span>
            `
        });
        html = '';
        stat.map((block, i) => {
            html += `
            <span class="${colors[i+1]}" style="padding:10px;">${block.category}: ${block.count}</span>
            `
        });
        
        projectCategorySection.innerHTML = html;
        /*  End */


        const selectStatus = document.querySelectorAll('#select-status');
        selectStatus.forEach(element => {
            element.addEventListener('change', (e) => {
                console.log('Selected Element value - ',e.target.value)
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