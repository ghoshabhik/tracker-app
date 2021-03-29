const colors = ['blue darken-2', 'blue darken-1',
    'blue', 'blue lighten-1', 'blue lighten-2', 'blue lighten-3', 'blue lighten-4', 'blue lighten-5', 'light-blue lighten-5',
    'light-blue lighten-4', 'light-blue lighten-3', 'light-blue lighten-2', 'light-blue lighten-1', 'light-blue'];
document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Document loaded')

    var elems = document.querySelectorAll('.datepicker');
    var options = {
        autoClose: true,
        format: 'yyyy-mm-dd',
        defaultDate: new Date(),
        setDefaultDate: true
    }
    var instances = M.Datepicker.init(elems, options);

});

const groupBy = (key, arr) => arr.reduce((cache, task) =>
({
    ...cache, [task[key]]:
        task[key] in cache
            ? cache[task[key]].concat(task)
            : [task]
}), {})

const refreshTaskData = () => {
    console.log('called refresh data......');
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;
    console.log(startDate, endDate)
    // db.collection('tasks').where('taskDate', '>=', firebase.firestore.Timestamp.fromDate(new Date(startDate)))
    //     .where('taskDate', '<=', firebase.firestore.Timestamp.fromDate(new Date(endDate)))
    //     .orderBy('taskDate')
    //     .onSnapshot(snapshot => {
    //         setupTasks(snapshot.docs);
    //     }, err => console.log(err.message));
    db.collection('tasks').where('taskDate', '>=', new Date(startDate))
        .where('taskDate', '<=', new Date(endDate))
        .orderBy('taskDate')
        .onSnapshot(snapshot => {
            setupTasks(snapshot.docs);
        }, err => console.log(err.message));
}

const deleteTask = (id) => {
    if (confirm("Confirm Delete")) {
        db.collection('tasks').doc(id).delete();
    } else {

    }

}

const editTask = async (id) => {
    var data = {}
    await db.collection('tasks').doc(id).get().then(snapshot => {
        data = snapshot.data();
    });
    var batch = db.batch()
    //console.log('received data------', data)
    document.getElementById('task-name-edit').value = data.taskName;
    document.getElementById('task-category-edit').value = data.taskCategory;
    document.getElementById('task-planned-hours-edit').value = data.taskPlannedHours;
    document.getElementById('task-actual-hours-edit').value = data.taskActualHours;
    document.getElementById('task-date-edit').value = data.taskDate.toDate().toISOString().substring(0, 10);
    document.getElementById('task-name-edit').focus();
    document.getElementById('task-category-edit').focus();
    document.getElementById('task-planned-hours-edit').focus();
    document.getElementById('task-actual-hours-edit').focus();
    document.getElementById('task-date-edit').focus();
    document.getElementById('edit-modal-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const updatedData = {
            taskName: document.getElementById('task-name-edit').value,
            taskCategory: document.getElementById('task-category-edit').value,
            taskPlannedHours: parseFloat(document.getElementById('task-planned-hours-edit').value),
            taskActualHours: parseFloat(document.getElementById('task-actual-hours-edit').value),
            taskDate: new Date(Date.parse(document.getElementById('task-date-edit').value))
        }
        //console.log('updated data ==== ', id, updatedData);
        const docRef = db.collection('tasks').doc(id)
        try {
            batch.update(docRef, updatedData)
            batch.commit().then(() => {
                const modal = document.querySelector('#modal-edit-task');
                M.Modal.getInstance(modal).close();
                document.getElementById('edit-task-form').reset();
            })
        } catch (e) {
            console.log(e.message)
        }

        // db.collection("tasks").doc(id).update(updatedData).then(() => {
        //     const modal = document.querySelector('#modal-edit-task');
        //     M.Modal.getInstance(modal).close();
        //     document.getElementById('edit-task-form').reset();
        //     console.log('form closed')
        // })

    })
    // });


}

// setup tasks
const setupTasks = (data) => {
    var tasksrow = document.getElementById('table-body');
    var actualPlannedSection = document.getElementById('actual-planned');
    var categorySection = document.getElementById('categories-actual-planned');
    var progressBar = document.querySelector('.progress');
    var countTasks = 0
    var totalPlannedHours = 0;
    var totalActualHours = 0;
    var dataArr = [];
    if (data.length) {
        let html = '';
        data.forEach(doc => {
            countTasks++;
            const task = doc.data();
            //console.log('doc======',doc)
            // console.log('Parent-----',task.parent.id)
            dataArr.push(task);
            const tr = `
            <tr>
            <td>${countTasks}</td>
            <td>${task.taskName}</td>
            <td>${task.taskCategory}</td>
            <td>${task.taskDate.toDate().toISOString().substring(0, 10)}</td>
            <td>${task.taskPlannedHours}</td>
            <td>${task.taskActualHours}</td>
            <td  id=${doc.id}><button class="edit-btn modal-trigger" id=${doc.id} data-target="modal-edit-task"><i class="material-icons" id=${doc.id}>edit</i></button> 
            <button class="delete-btn" id=${doc.id}><i class="material-icons" id=${doc.id}>delete</i></button></td>
            </tr>
        `;
            html += tr;
            totalPlannedHours += task.taskPlannedHours;
            totalActualHours += task.taskActualHours;
        });
        const groupedData = groupBy('taskCategory', dataArr);
        const categoryArr = Object.keys(groupedData);
        const stat = [];
        var plannedHours = 0;
        var actualHours = 0;
        categoryArr.forEach(category => {
            groupedData[category].map(unit => {
                plannedHours += unit.taskPlannedHours;
                actualHours += unit.taskActualHours;
            })
            stat.push({
                category: category,
                plannedHours: plannedHours,
                actualHours: actualHours
            });
            plannedHours = 0;
            actualHours = 0;
        });
        tasksrow.innerHTML = html
        html = `
            <div class="determinate" style="width: ${(totalActualHours.toFixed(2) / totalPlannedHours.toFixed(2)) * 100}%"></div>
        `
        //console.log(totalActualHours / totalPlannedHours);
        progressBar.innerHTML = html;
        actualPlannedSection.innerHTML =
            `
            <span class="red lighten-1 black-text" style="padding:10px;">Planned: ${totalPlannedHours.toFixed(2)}</span>
            <span class="green lighten-2 black-text" style="padding:10px;">Actual: ${totalActualHours.toFixed(2)}</span>
            `
        html = '';
        stat.sort((a, b) => (a.plannedHours > b.plannedHours) ? -1 : ((b.plannedHours > a.plannedHours) ? 1 : 0))
        stat.map((block, i) => {
            html += `
            <span class="${colors[i]}" style="padding:10px;">${block.category}: ${block.actualHours}/${block.plannedHours}</span>
            `
        });
        categorySection.innerHTML = html;

    } else {
        tasksrow.innerHTML = '';
        progressBar.innerHTML = '';
        categorySection.innerHTML = '';
        actualPlannedSection.innerHTML =
            `
            <span class="red lighten-1 black-text" style="padding:10px;">Actual: 0</span>
            <span class="green lighten-2 black-text" style="padding:10px;">Planned: 0</span>
            
            `
    }
    const deleteBtn = document.querySelectorAll('.delete-btn')
    deleteBtn.forEach(del => {
        del.addEventListener('click', (e) => {
            console.log('delete ', e.target.id);
            deleteTask(e.target.id);
        })
    })
    const editBtn = document.querySelectorAll('.edit-btn')
    editBtn.forEach(edit => {
        edit.addEventListener('click', (e) => {
            console.log('edit ', e.target.id);
            //test(e.target.id)
            editTask(e.target.id);
        })
    })
    const test = (id) => {
        console.log('id =>>>', id)
    }

};

auth.onAuthStateChanged(user => {
    if (user) {

    } else {
        window.location = "/";
    }
})



const refreshBtn = document.getElementById('refresh-btn');
refreshBtn.addEventListener('click', (e) => {
    refreshTaskData();
    // const getAirtableData = firebase.functions().httpsCallable('getAirtableData');
    // getAirtableData().then(result => {
    //     console.log(result.data);
    //   });
})

const defaultTaskButton = document.getElementById('default-tasks');
defaultTaskButton.addEventListener('click', () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = weekDays[(new Date()).getDay()]
    currentDateString = (new Date()).toISOString().substring(0, 10)
    currentDateForFirestore = new Date(Date.parse(currentDateString))
    //console.log(currentDateForFirestore)
    var data = [];
    db.collection('defaulttasks')
        .where('dayOfWeek', '==', day)
        .get().then(snapshot => {
            data = snapshot.docs;
            data.forEach(task => {
                console.log(task.data())
                db.collection('tasks').add({
                    taskActualHours: 0,
                    taskCategory: task.data().category,
                    taskDate: currentDateForFirestore,
                    taskName: task.data().name,
                    taskPlannedHours: task.data().plannedHours
                })
                
            })

        });
});


const handleDelete = (e) => {
    console.log('clicked -- ', e.target.id)
}

// create new task
const createForm = document.querySelector('#new-task-form');
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    data = {
        taskName: createForm['task-name'].value,
        taskCategory: createForm['task-category'].value,
        taskPlannedHours: parseFloat(createForm['task-planned-hours'].value),
        taskActualHours: parseFloat("0.0"),
        taskDate: new Date(Date.parse(createForm['task-date'].value))
    }
    db.collection('tasks').add(data).then(() => {
        // close the create modal & reset form
        const modal = document.querySelector('#modal-create-task');
        M.Modal.getInstance(modal).close();
        createForm.reset();
    });

    //console.log(data)
});