// Variables
let $ = (selector) => document.querySelector(selector),
  $_ = (selector) => document.querySelectorAll(selector),
  appContainer = $(".to-do-container"),
  taskInput = $(".to-do-container .add-task input#add-task"),
  addTaskForm = $(".to-do-container .add-task > form"),
  noTasks = $(".to-do-container .tasks .no-tasks"),
  tasksCount = $(".tasks-stats .tasks-count span"),
  completedTasks = $(".tasks-stats .tasks-completed span"),
  tasksInStorage;

// // Works
// let promise = Notification.requestPermission();
// Push.create('Hello World!')

window.onload = function () {
  importStorage(`Tasks${getCurrentDay()}`);
  countTasks();
  markDays();
  window.scrollTo(0, 1);
  $(`.week .days > div.${getCurrentDay()}`).classList.add('active');
  if (localStorage.getItem('dark-mode') == 1) {
    if($(".dark-light-trigger").classList.contains("light-active")) {
      $(".dark-light-trigger").classList.remove("light-active");
      $(".dark-light-trigger").classList.add("dark-active");
      document.body.classList.add("dark");
    }
  } else if (localStorage.getItem('light-mode') == 1) {
    if ($(".dark-light-trigger").classList.contains("dark-active")) {
      $(".dark-light-trigger").classList.remove("dark-active");
      $(".dark-light-trigger").classList.add("light-active");
      document.body.classList.remove("dark");
    }
  };
  $('.week').style.left = `-${$('.week').getBoundingClientRect().width}px`;      

};

taskInput.addEventListener('focus', function () {
  this.setAttribute('placeholder', '');
})

taskInput.addEventListener('blur', function () {
  this.setAttribute('placeholder', this.dataset.placeholder);
})


addTaskForm.onsubmit = function (e) {
  e.preventDefault();
  if (taskInput.value == "" || taskInput.value == " ") {
    $("#emptyInput").play();
    // $('.notify.emptyInput').classList.add('active');
    // setTimeout(() => {
    //     $('.notify.emptyInput').classList.remove('active');
    // }, 2000)
    Swal.fire({
      title: "خطأ !",
      text: "المهمة لا يجب ان تكون فارغة...!",
      icon: "error",
      confirmButtonText: "حسنا",
    });
  } else if (checkSameTask(taskInput.value)) {
    $("#emptyInput").play();
    // $('.notify.emptyInput').classList.add('active');
    // setTimeout(() => {
    //     $('.notify.emptyInput').classList.remove('active');
    // }, 2000)
    Swal.fire({
      title: "خطأ!",
      text: "تم اضافة المهمة بالفعل...!",
      icon: "error",
      confirmButtonText: "حسنا",
    });
  } else {
    noTasks.classList.contains("hide") ? null : noTasks.classList.add("hide");
    addTask();
    $("#success").play();
    Swal.fire("رااائع!", "تم اضافة المهمة...!", "success");
    countTasks();
    storeTasks();
    markDays();
    taskInput.value = "";
    taskInput.blur();
    taskInput.classList.remove("valid");
  }
};

let count = 1;
$(".to-do-container").addEventListener("click", function (e) {
  if (
    e.target.parentElement.classList.contains("task") &&
    e.target.classList.contains("delete") 
  ) {
    // The target event property returns the element that triggered the event.
    // e -> MouseEvents "Events that occur when the mouse interacts with the HTML document belongs to the MouseEvent Object."
    $("#emptyInput").play();
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن يكون باستطاعتك التراجع عن هذا !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم احذفها!",
    }).then((result) => {
      if (result.isConfirmed) {
        e.target.parentElement.remove();
        if ($_(".to-do-container .tasks .task").length == 0) {
          noTasks.classList.remove("hide");
        }
        $("#success").play();
        Swal.fire("تم!", "تم حذف المهمة بنجاح.", "success");
        countTasks();
        storeTasks();
        markDays();
      }
    });
  } else if (
    e.target.parentElement.classList.contains("task") &&
    e.target.classList.contains("edit")
  ) {
    let currentTask = e.target.parentElement,
      editBox = document.createElement("form"),
      editInput = document.createElement("input"),
    submitInput = document.createElement("input");
    editBox.id = "edit-box";
    editInput.type = "text";
    editInput.value = e.target.parentElement.firstElementChild.textContent;
    submitInput.type = "submit";
    submitInput.value = "تعديل";
    editInput.classList.add("edit-input");
    editBox.append(editInput);
    editBox.append(submitInput);
    currentTask.append(editBox);
      countTasks();
      storeTasks();
      markDays();
    $(".to-do-container .tasks .task #edit-box").onsubmit = function (e) {
      e.preventDefault();
      let editedText = this.children[0].value;
      if (checkSameTask(editedText)) {
        $("#emptyInput").play();
        Swal.fire({
          title: "خطأ!",
          text: "تم اضافة المهمة بالفعل...!",
          icon: "error",
          confirmButtonText: "حسنا",
        });
      } else if (editedText == "") {
        $("#emptyInput").play();
        Swal.fire({
          title: "خطأ!",
          text: "من فضلك أكتب شيء...!",
          icon: "error",
          confirmButtonText: "حسنا",
        });
      } else {
        this.parentElement.firstChild.textContent = editedText;
        this.remove();
        storeTasks();
        markDays();
      }
    };
  } else if (
    e.target.parentElement.classList.contains("task") &&
    e.target.classList.contains("complete")
  ) {
    if (e.target.classList.contains('active')) {
      unCompleteCurrentTask(e.target.parentElement);
      e.target.classList.remove('active');
    } else {
      completeCurrentTask(e.target.parentElement);
      e.target.classList.add('active');
    }
  } else if (e.target.classList.contains('hash-tag')) {
    e.target.remove();
    storeTasks();
    markDays();
  } else if (e.target.parentElement.classList.contains('hash-tag') && e.target.classList.contains('delete')) {
    e.target.parentElement.remove();
    storeTasks();
    markDays();
  } else if (e.target.parentElement.classList.contains('svg-inline--fa') && e.target.tagName == 'path') {
    if (e.target.parentElement.parentElement.classList.contains('task')) {
      e.target.parentElement.parentElement.remove();
      storeTasks();
      markDays();
    }
  }
});

$(".tasks-control .delete-all").addEventListener("click", function () {
  if ($_(".to-do-container .tasks .task").length !== 0) {
    $("#emptyInput").play();
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن يكون باستطاعتك التراجع عن هذا !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم احذفها!",
    }).then((result) => {
      if (result.isConfirmed) {
        $_(".to-do-container .tasks .task").forEach(function (task) {
          task.remove();
        });
        noTasks.classList.remove("hide");
        $("#success").play();
        Swal.fire("تم!", "تم حذف المهمة بنجاح.", "success");
        countTasks();
        storeTasks();
        markDays();
      }
    });
  } else {
    $("#emptyInput").play();
    Swal.fire({
      title: "خطأ!",
      text: "لا يوجد مهمات لحذفها...!",
      icon: "error",
      confirmButtonText: "حسنا",
    });
  }
});

$(".tasks-control .complete-all").addEventListener("click", function () {
  if ($_(".to-do-container .tasks .task").length !== 0) {
    if (checkAllFinished()) {
      $("#emptyInput").play();
      Swal.fire({
        title: "خطأ!",
        text: "جميع المهمات مكتملة بالفعل...!",
        icon: "error",
        confirmButtonText: "حسنا",
      });
    } else {
      $_(".to-do-container .tasks .task").forEach(function (task) {
        if (!task.classList.contains("finished")) {
          task.classList.add("finished");
          $('.tasks .finished-tasks').append(task);
          task.querySelector('.complete').classList.add('active');
        }
        $("#success").play();
        Swal.fire("راااائع!", "لقد أنجزت جميع مهامك...!", "success");
        countTasks();
        storeTasks();
        markDays();
      });
    }
  } else {
    $("#emptyInput").play();
    Swal.fire({
      title: "خطأ!",
      text: "لا يوجد مهمات لاكمالها...!",
      icon: "error",
      confirmButtonText: "حسنا",
    });
  }
});
$(".dark-light-trigger").addEventListener("click", function () {
  if (this.classList.contains("dark-active")) {
    this.classList.remove("dark-active");
    this.classList.add("light-active");
    document.body.classList.remove("dark");
    localStorage.setItem('light-mode', 1);
    localStorage.setItem('dark-mode', 0);
  } else if (this.classList.contains("light-active")) {
    this.classList.remove("light-active");
    this.classList.add("dark-active");
    document.body.classList.add("dark");
    localStorage.setItem('dark-mode', 1);
    localStorage.setItem('light-mode', 0);
  }
});

$(".add-task .hash").addEventListener("click", function () {
  x = taskInput.value;
  if (x.search("#") != -1 && x.charAt(x.search("#") + 1) == " ") {
    $("#emptyInput").play();
    Swal.fire({
      title: "خطأ!",
      text: "  من فضلك أكمل الهاشتاج الحالي ...!",
      icon: "error",
      confirmButtonText: "حسنا",
    });
  } else if (x.search("#") != -1 && x.search("#") == x.length - 1) {
    $("#emptyInput").play();
    Swal.fire({
      title: "خطأ!",
      text: "  من فضلك أكمل الهاشتاج الحالي ...!",
      icon: "error",
      confirmButtonText: "حسنا",
    });
  } else {
    taskInput.value += " #";
    taskInput.focus();
  }
});
$(".add-task .brush input[type='color']").addEventListener("change", function () {
  $('.to-do-container .add-task .color-dot').style.backgroundColor = this.value;
});
taskInput.addEventListener("keydown", function (event) {
  let keyboardCode = event.which;
  console.log(event);
  if (keyboardCode == 32 || keyboardCode == 188 || keyboardCode == 13) {
    if (taskInput.value.indexOf("#") != -1) {
      if (taskInput.value.indexOf("#") != taskInput.value.length - 1) {
        let text = taskInput.value,
          afterHash = text.substr(text.indexOf("#")),
          hash = afterHash.substr(0);
        let newText = text.replace(hash, "");
        addTag(hash);
        taskInput.value = newText.trim();
      } else {
        $("#emptyInput").play();
        Swal.fire({
          title: "خطأ!",
          text: "  من فضلك أكمل الهاشتاج الحالي ...!",
          icon: "error",
          confirmButtonText: "حسنا",
        });
        let text = taskInput.value,
          newText = text.substr(0, text.indexOf("#") + 1);
        taskInput.value = newText;
      }
    }
    let hash = $('.add-task .hash-tag');
if (!(hash == null)) {
  hash.addEventListener('click', function () {
    this.remove();
    storeTasks();
    markDays();
  })
} 
  }
});


// Functions

function taskCreator(taskValue, pickedColor) {
  (taskBox = document.createElement("span")),
    (taskContent = document.createElement("span")),
    (taskContentText = document.createTextNode(taskValue)),
    (deleteTask = document.createElement("span")),
    (completeTask = document.createElement("span")),
    (completeText = document.createTextNode("check")),
    (editTask = document.createElement("span")),
    (editText = document.createTextNode("border_color")),
    (colorDot = document.createElement("span"));
  taskContent.classList.add("task-content");
  taskContent.append(taskContentText);``
  taskBox.classList.add("task");
  taskBox.draggable="true";
  taskBox.append(taskContent);
  deleteTask.classList.add("delete");
  deleteTask.classList.add("material-icons");
  deleteTask.innerHTML = 'clear';
  completeTask.classList.add("complete");
  completeTask.classList.add("material-icons");
  completeTask.append(completeText);
  editTask.classList.add("edit");
  editTask.classList.add("material-icons");
  colorDot.classList.add('color-dot');
  if(pickedColor == '#ffffff' || pickedColor == 'transparent') {
    colorDot.style.backgroundColor = 'transparent';
  } else {
    colorDot.style.backgroundColor = pickedColor;
    taskBox.style.borderLeftColor = colorDot.style.backgroundColor;
  }
  editTask.append(editText);
  taskBox.append(deleteTask);
  taskBox.append(completeTask);
  taskBox.append(editTask);
  taskBox.append(colorDot);
  
  taskBox.addEventListener('dragstart', function () {
    this.classList.add('hideDrag');
  });

  taskBox.addEventListener('touchstart', function () {
    document.body.style.overflow = 'hidden';
  })

  taskBox.addEventListener('touchend', function () {
    document.body.style.overflow = 'auto';
  })
  
  taskBox.addEventListener('dragend', function () {
    this.classList.remove('hideDrag');
    if (this.parentElement.classList.contains('finished-tasks')) {
      if (!(this.classList.contains('finished'))) {
        this.classList.add('finished')
        this.querySelector('.complete').classList.add('active')
        $("#success").play();
        Swal.fire("راااائع!", "لقد أنجزت المهمة...!", "success");
      }
    } else {
      if (this.classList.contains('finished')) {
        this.classList.remove('finished');
        this.querySelector('.complete').classList.remove('active')
      }
    }
    countTasks();
    storeTasks(); 
    markDays();
  });


}

$('.tasks .unfinished-tasks').addEventListener('dragover', function (e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(this, e.clientY);
  const draggable = document.querySelector('.hideDrag');
  if (afterElement == null) {
    this.appendChild(draggable);
  } else {
    this.insertBefore(draggable, afterElement);
  }
  
})

$('.tasks .finished-tasks').addEventListener('dragover', function (e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(this, e.clientY);
  const draggable = document.querySelector('.hideDrag');
  if (afterElement == null) {
    this.appendChild(draggable);
  } else {
    this.insertBefore(draggable, afterElement);
  }
})

$_('.week .days > div').forEach(day => {
  day.addEventListener('click' , function () {
    emptyApp();
    importStorage(`Tasks${day.dataset.day}`)
    countTasks();
    let siblings = Array.from(this.parentElement.children);
    siblings.forEach(sibling => {
      sibling.classList.remove('active');
    })
    this.classList.add('active');
  });
});

$('.week .icon').addEventListener('click', function () {
    if (this.classList.contains('active')) {
      this.classList.remove('active');
      this.parentElement.style.left = 0;
      // $('.to-do-container').classList.remove('full');     
    } else {
      this.classList.add('active');
      this.parentElement.style.left = `-${this.parentElement.getBoundingClientRect().width}px`;
      // $('.to-do-container').classList.add('full');     
    }
})

// window.addEventListener('resize', function () {
//     if (!$('.week .icon').classList.contains('active')) {
//       $('.week').style.left = 0;
//     } else {
//       $('.week').style.left = `-${$('.week .icon').parentElement.getBoundingClientRect().width}px`;
//     }
// })

window.addEventListener('orientationchange', function () {
  if (!$('.week .icon').classList.contains('active')) {
    $('.week').style.left = 0;
  } else {
    $('.week').style.left = 0;
  }
})

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task:not(.hideDrag)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset =  y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return {offset: offset, element: child}
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function addTask() {
  let taskValue = taskInput.value;
  let pickedColor = $('.add-task .brush input[type="color"]').value;
  taskCreator(taskValue, pickedColor);
  $(".to-do-container .tasks .unfinished-tasks").append(taskBox);
  let hashBox = document.createElement("div");
  hashBox.className = "hash-box";
  $_(".add-task .hash-tag").forEach(function (hash) {
    hashBox.append(hash);
  });
  taskBox.append(hashBox);
}

function checkSameTask(target) {
  let result;
  if ($_(".to-do-container .tasks .task").length !== 0) {
    $_(".to-do-container .tasks .task").forEach(function (task) {
      if (target == task.children[0].textContent) {
        result = true;
      } else {
        result = false;
      }
    });
    return result;
  } else {
    return false;
  }
}

function checkAllFinished() {
  let result = true;
  $_(".to-do-container .tasks .task").forEach(function (task) {
    if (!task.classList.contains("finished")) {
      result = false;
    }
  });
  return result;
}

function countTasks() {
  let all,
    completed = 0;
    uncompleted = 0;
  all = $_(".to-do-container .tasks .task").length;
  $_(".to-do-container .tasks .task").forEach(function (task) {
    if (task.classList.contains("finished")) {
      completed++
    } else {
      uncompleted++;
    }
  });
  $(".tasks-stats .tasks-count span").textContent = all;
  $(".to-do-container .tasks h3 span.completed-tasks").textContent = completed;
  $(".to-do-container .tasks h3 span.uncompleted-tasks").textContent = uncompleted;
}

function storeTasks() {
  let tasks = $_(".to-do-container .tasks .task"),
    tasksInStorage = {
      finished: [],
      unfinished: [],
      finishedTaskPickedColor: [],
      unFinishedTaskPickedColor: [],
    };
  if (tasks.length != 0) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].classList.contains("finished")) {
          let currentFinished = [];
          currentFinished.push(tasks[i].children[0].textContent);
          for (let f of tasks[i].children) {
            if (f.classList.contains("hash-box")) {
              for (let fc of f.children) {
                currentFinished.push(fc.textContent);
              }
            }
          }
          tasksInStorage.finished.push(currentFinished);
          let toFilterChildren = Array.from(tasks[i].children);
          let taskColor = toFilterChildren.filter(e => e.classList.contains('color-dot'));
          tasksInStorage.finishedTaskPickedColor.push(taskColor[0].style.backgroundColor);  
      } else {
        let currentUnfinished = [];
        currentUnfinished.push(tasks[i].children[0].textContent);
        for (let un of tasks[i].children) {
          if (un.classList.contains("hash-box")) {
            for (let unc of un.children) {
              currentUnfinished.push(unc.textContent);
            }
          }
        }
        tasksInStorage.unfinished.push(currentUnfinished);
        let toFilterChildren = Array.from(tasks[i].children);
        let taskColor = toFilterChildren.filter(e => e.classList.contains('color-dot'));
        tasksInStorage.unFinishedTaskPickedColor.push(taskColor[0].style.backgroundColor);  
      }
    }
  }
  let storageName = `Tasks${$('.week .days > div.active').dataset.day}`;
  console.log(storageName);
  localStorage.setItem(storageName, JSON.stringify(tasksInStorage));
  console.log(localStorage.getItem(`Tasks${$('.week .days > div.active').dataset.day}`));
}

function importStorage(storageName) {
  if (
    localStorage.getItem(storageName) != null ||
    localStorage.getItem(storageName) != undefined
  ) {
    if (
      JSON.parse(localStorage.getItem(storageName)).finished.length == 0 &&
      JSON.parse(localStorage.getItem(storageName)).unfinished.length == 0
    ) {
      null;
    } else {
      let finishedStoredTasks = JSON.parse(localStorage.getItem(storageName))
          .finished,
        unfinishedStoredTasks = JSON.parse(localStorage.getItem(storageName))
          .unfinished,
          finishedTaskPickedColor = JSON.parse(localStorage.getItem(storageName))
          .finishedTaskPickedColor,
          unFinishedTaskPickedColor = JSON.parse(localStorage.getItem(storageName))
          .unFinishedTaskPickedColor;
      if (unfinishedStoredTasks.length != 0) {
        for (let i = 0; i < unfinishedStoredTasks.length; i++) {
          taskCreator(unfinishedStoredTasks[i][0], unFinishedTaskPickedColor[i]);
          let hashBox = document.createElement("div");
          hashBox.className = "hash-box";
          for (x = 0; x < unfinishedStoredTasks[i].length; x++) {
            if (x != 0) {
              let hashTag = document.createElement("span"),
                hashTagText = document.createTextNode(
                  unfinishedStoredTasks[i][x]
                ),
                deleteIcon = document.createElement('i');
                deleteIcon.classList.add('fas');
                deleteIcon.classList.add('fa-times-circle');
                deleteIcon.classList.add('delete');
              hashTag.append(deleteIcon);
              hashTag.append(hashTagText);
              hashTag.classList.add("hash-tag");
              hashBox.append(hashTag);
              taskBox.append(hashBox);
            }
          }
          $(".to-do-container .tasks .unfinished-tasks").append(taskBox);
        }
        noTasks.classList.contains("hide")
          ? null
          : noTasks.classList.add("hide");
      }
      if (finishedStoredTasks.length != 0) {
        for (let i = 0; i < finishedStoredTasks.length; i++) {
          taskCreator(finishedStoredTasks[i][0], finishedTaskPickedColor[i]);
          completeTask.classList.add('active');
          let hashBox = document.createElement("div");
          hashBox.className = "hash-box";
          for (x = 0; x < finishedStoredTasks[i].length; x++) {
            if (x != 0) {
              let hashTag = document.createElement("span"),
                hashTagText = document.createTextNode(
                  finishedStoredTasks[i][x]
                ),
                deleteIcon = document.createElement('i');
                deleteIcon.classList.add('fas');
                deleteIcon.classList.add('fa-times-circle');
                deleteIcon.classList.add('delete');
            hashTag.append(deleteIcon);
              hashTag.append(hashTagText);
              hashTag.classList.add("hash-tag");
              hashBox.append(hashTag);
              taskBox.append(hashBox);
            }
          }
          taskBox.classList.add('finished');
          $(".to-do-container .tasks .finished-tasks").append(taskBox);
        }
        noTasks.classList.contains("hide")
          ? null
          : noTasks.classList.add("hide");
      }
    }
  }
}

function completeCurrentTask(element) {
  if (!element.classList.contains("finished")) {
    element.classList.add("finished");
    count = 0;
    $('.tasks .finished-tasks').append(element);
    $("#success").play();
    Swal.fire("راااائع!", "لقد أنجزت المهمة...!", "success");
    countTasks();
    storeTasks();
  } 
}

function unCompleteCurrentTask(element) {
  if (element.classList.contains("finished")) {
    element.classList.remove("finished");
    count = 1;
    $('.tasks .unfinished-tasks').append(element);
    countTasks();
    storeTasks();
  } 
}

function addTag(hash) {
  let hashTag = document.createElement("span"),
    hashTagText = document.createTextNode(hash),
    deleteIcon = document.createElement('i');
  deleteIcon.classList.add('fas');
  deleteIcon.classList.add('fa-times-circle');
  deleteIcon.classList.add('delete');
  hashTag.append(deleteIcon);
  hashTag.append(hashTagText);
  hashTag.classList.add("hash-tag");
  $(".input-field").append(hashTag);
}

function emptyApp() {
  let tasks = $_('.to-do-container .tasks .task');
  tasks.forEach(task => {
    task.remove();
  })
  countTasks();
  noTasks.classList.contains("hide")
  ? noTasks.classList.remove("hide")
  : null;
}

function getCurrentDay() {
  let date = new Date();
  let weekdays = new Array(7);
  weekdays[0] = "sunday";
  weekdays[1] = "monday";
  weekdays[2] = "tuesday";
  weekdays[3] = "wednesday";
  weekdays[4] = "thursday";
  weekdays[5] = "friday";
  weekdays[6] = "saturday";
  let currentDay = weekdays[date.getDay()];
  return currentDay;
}


function markDays() {
  let weekdays = new Array(7);
  let today = getCurrentDay();
  weekdays[0] = "saturday";
  weekdays[1] = "sunday";
  weekdays[2] = "monday";
  weekdays[3] = "tuesday";
  weekdays[4] = "wednesday";
  weekdays[5] = "thursday";
  weekdays[6] = "friday",
  missedDaysCount = 0,
  currentDaysCount = 0,
  nextDaysCount = 0;
  $_('.week .days > div').forEach(day => {
    day.classList.contains('missed-day') ? day.classList.remove('missed-day') : null;
    day.classList.contains('current-day') ? day.classList.remove('current-day') : null;
    day.classList.contains('next-day') ? day.classList.remove('next-day') : null;
    let currentDay = day.dataset.day,
        currentDayStorage = JSON.parse(localStorage.getItem(`Tasks${currentDay}`));
    if ( !(currentDayStorage == null) || !(currentDayStorage == undefined)) {
      if (!(currentDayStorage.unfinished.length == 0)) {
        console.log(weekdays.indexOf(currentDay) == weekdays.indexOf(today));
        if (weekdays.indexOf(currentDay) < weekdays.indexOf(today)) {
          day.classList.add('missed-day');
          missedDaysCount += currentDayStorage.unfinished.length;
        } else if (weekdays.indexOf(currentDay) == weekdays.indexOf(today)) {
          day.classList.add('current-day');
          currentDaysCount += currentDayStorage.unfinished.length;
        } else if (weekdays.indexOf(currentDay) > weekdays.indexOf(today)) {
          day.classList.add('next-day');
          nextDaysCount += currentDayStorage.unfinished.length;
        }
      }
    }
  });
  $('.week .icon .mark.missed').classList.add('hidden');
  $('.week .icon .mark.current').classList.add('hidden');
  $('.week .icon .mark.next').classList.add('hidden');
  if (missedDaysCount > 0) {
    $('.week .icon .mark.missed').classList.remove('hidden');
    $('.week .icon .mark.missed').innerHTML = missedDaysCount;
  }
  if (nextDaysCount > 0) {
    $('.week .icon .mark.next').classList.remove('hidden');
    $('.week .icon .mark.next').innerHTML = nextDaysCount;
  }
  if (currentDaysCount > 0) {
    $('.week .icon .mark.current').classList.remove('hidden');
    $('.week .icon .mark.current').innerHTML = currentDaysCount;
  }
}

// ---------------------------------------------- PWA ----------------------------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("../serviceWorker2.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}

// Notification.requestPermission(status => {
//   console.log('Notification', status);
// })

// function displayNotification() {
//   if (Notification.permission === 'granted') {
//     navigator.serviceWorker.getRegistration()
//       .then(reg => {
//         reg.showNotification('hello')
//       })
//   }
// }

// displayNotification();

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('👍', 'beforeinstallprompt', event);
  // Stash the event so it can be triggered later.
  window.deferredPrompt = event;
  // Remove the 'hidden' class from the install button container
  $('.download-btn').classList.remove('hidden');
});

$('.download-btn button').addEventListener('click', async () => {
  console.log('👍', 'butInstall-clicked');
  const promptEvent = window.deferredPrompt;
  if (!promptEvent) {
    // The deferred prompt isn't available.
    return;
  }
  // Show the install prompt.
  promptEvent.prompt();
  // Log the result
  const result = await promptEvent.userChoice;
  console.log('👍', 'userChoice', result);
  // Reset the deferred prompt variable, since
  // prompt() can only be called once.
  window.deferredPrompt = null;
  // Hide the install button.
  $('.download-btn').classList.add('hidden');
});

$('.download-btn .close').addEventListener('click', function() {
  $('.download-btn').classList.add('hidden');
});

window.addEventListener('appinstalled', (event) => {
  console.log('👍', 'appinstalled', event);
  // Clear the deferredPrompt so it can be garbage collected
  window.deferredPrompt = null;
});



// // Detects if device is on iOS 
// const isIos = () => {
//   const userAgent = window.navigator.userAgent.toLowerCase();
//   return /iphone|ipad|ipod/.test( userAgent );
// }
// // Detects if device is in standalone mode
// const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

// // Checks if should display install popup notification:
// if (isIos() && !isInStandaloneMode()) {
//   this.setState({ showInstallMessage: true });
//   document.body.style.backgroundColor = 'red';
// }


