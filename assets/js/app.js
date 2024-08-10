const cl =console.log;

const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const contentControl = document.getElementById('content');
const userIdControl = document.getElementById('userId');
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
const postContainer = document.getElementById('postContainer');
const loader = document.getElementById('loader');

const BASE_URL = `https://post-crud-56394-default-rtdb.asia-southeast1.firebasedatabase.app/`;

const POST_URL =`${BASE_URL}/posts.json`;

const sweetAlert =(msg,icon)=>{
    Swal.fire({
        title :msg,
        timer:2500,
        icon:icon,
    })
}
const templating =(arr)=>{
    let result='';
    arr.forEach(post=>{
        result+=
        `<div class="col-md-4 mb-4">
            <div class="card postCard h-100" id="${post.id}">
                <div class="card-header">
                    <h3 class="m-0">
                       ${post.title}
                    </h3>
                </div>
                <div class="card-body">
                    <p>${post.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                   <button class="btn btn-primary btn-sm"onclick="onEdit(this)">Edit</button>
                   <button class="btn btn-danger btn-sm "onclick="onRemove(this)">Remove</button>
                </div>
            </div>
        </div>
        `
    })
    postContainer.innerHTML =result;
}

const makeApiCall =(mehtodName,apiUrl,msgBody)=>{
    return new Promise((resolve,reject)=>{
        loader.classList.remove('d-none')
        let xhr = new XMLHttpRequest()

        xhr.open(mehtodName,apiUrl)

        xhr.send(JSON.stringify(msgBody))

        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status <300){
                let data = JSON.parse(xhr.response)
                resolve(data);
            }else{
                reject(`Something went wrong`)
            }
            loader.classList.add('d-none')
        }
        xhr.onerror = function(){
            loader.classList.add('d-none')
        }
    })
}
makeApiCall("GET",POST_URL)
    .then(res=>{
        cl(res)
        let postArr=[]
        for (const key in res) {
            let obj = {...res[key],id :key};
            postArr.unshift(obj);
        }
        templating(postArr)
    })
    .catch(err=>{
        cl(err)
    })
    .finally(()=>{
        loader.classList.add('d-none')
    })

const onPostUpdate=(eve)=>{
    //updatedid
    let updatedId=localStorage.getItem('editId')
    cl(updatedId)
    //updated obj
    let updatedObj = {
        title : titleControl.value,
        body : contentControl.value.trim(),
        userId : userIdControl.value,
    }
    cl(updatedObj)
    //updated url
    let UPDATED_URL = `${BASE_URL}/posts/${updatedId}.json`

    //api call
    makeApiCall("PATCH",UPDATED_URL,updatedObj)
        .then(res=>{
            cl(res)
            res.id = updatedId;
            let card = [...document.getElementById(res.id).children];
            card[0].innerHTML =` <h3 class="m-0"> ${res.title} </h3>`
            card[1].innerHTML =` <p class="m-0"> ${res.body} </p>`
            sweetAlert(`${res.title} is updated successfully`)
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            updateBtn.classList.add('d-none')
            submitBtn.classList.remove('d-none')
            postForm.reset();
            loader.classList.add('d-none')
        })
        

}

const onRemove=(ele)=>{
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
            let removeId = ele.closest('.card').id;
            let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`
            makeApiCall("DELETE",REMOVE_URL)
                .then(res=>{
                    cl(res)
                    ele.closest('.card').parentElement.remove()
                })
                .catch(err=>{
                    cl(err)
                })
        }
      });
    
}
const onEdit=(ele)=>{
    let editId =ele.closest('.card').id;
    localStorage.setItem("editId",editId);

    window.scrollTo({
        top:0,
        behavior:'smooth',
    })
    //apiurl
    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`
    //api call
    makeApiCall("GET",EDIT_URL)
        .then(res=>{
            cl(res)
            titleControl.value =res.title;
            contentControl.value =res.body;
            userIdControl.value =res.userId;
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            submitBtn.classList.add('d-none')
            updateBtn.classList.remove('d-none')
            loader.classList.add('d-none')
        })
}


const onPostAdd=(eve)=>{
    eve.preventDefault();
    let obj ={
        title : titleControl.value,
        body : contentControl.value.trim(),
        userId : userIdControl.value,
    }
    cl(obj);
    makeApiCall("POST",POST_URL,obj)
        .then(res=>{
            cl(res)
            obj.id = res.name

            let div =document.createElement('div');
            div.className =`col-md-4 mb-4`
            div.innerHTML = ` <div class="card postCard h-100" id="${obj.id}">
                <div class="card-header">
                    <h3 class="m-0">
                       ${obj.title}
                    </h3>
                </div>
                <div class="card-body">
                    <p>${obj.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                   <button class="btn btn-primary btn-sm "onclick="onEdit(this)">Edit</button>
                   <button class="btn btn-danger btn-sm "onclick="onRemove(this)">Remove</button>
                </div>
            </div>
            `
            postContainer.prepend(div)
            sweetAlert(`${obj.title} is Added successfully`)
            
        })
        .catch(err=>{
            sweetAlert('error')
        })
        .finally(()=>{
            postForm.reset()
            loader.classList.add('d-none')
        })
}









postForm.addEventListener("submit",onPostAdd);
updateBtn.addEventListener("click",onPostUpdate);