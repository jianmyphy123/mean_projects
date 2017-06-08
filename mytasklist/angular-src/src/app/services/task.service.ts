import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TaskService {

  constructor( private http: Http ) {
    console.log('Task Service Initialized...');
  }

  getTasks() {
    return this.http.get('http://localhost:3000/api/tasks')
      .map(res => res.json());
  }

  addTask(newTask) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/api/task', newTask, headers)
      .map(res => res.json());
  }

  deleteTask(id) {
    return this.http.delete('http://localhost:3000/api/task/'+id)
      .map(res => res.json());
  }

  updateStatus(task) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.put('http://localhost:3000/api/task/'+task._id, task, headers)
      .map(res => res.json());
  }
}
