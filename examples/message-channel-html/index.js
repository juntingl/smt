/**
 * 简化的任务调度器实现
 * 通过 MessageChannel Web API 实现，用于模拟浏览器的事件循环机制。
 *
 *
 */
let startTime = -1;
let isMessageLoopRunning = false;
let scheduledHostCallback = null; // 当前被调度的任务
const frameInterval = 5; // 默认的时间切片时间，每一帧的间隔
const taskQueue = []; // 任务队列
// 获得高精度的时间戳
const getCurrentTime = () => performance.now();

// 返回一个带有两个 MessagePort 属性的 MessageChannel 新对象。
const channel = new MessageChannel();
// 这里我们定义 port1 是消息消费者，port2 是消息提供者
const port = channel.port2;

// 发送消息来触发任务的执行，在截至时间前完成任务执行
const schedulePerformWorkUntilDeadline = () => {
  port.postMessage(null);
};

// 消息处理函数，接收到消息时被调用
// 执行任务直到截止时间或任务队列为空
const performWorkUntilDeadline = () => {
   // 每次调度的时候记录下当前时间
  const currentTime = getCurrentTime();
  startTime = currentTime;
  let hasMoreWork = true;
  try {
    // 执行当前被调度的任务，并且确认当前是否还有被调用的任务
    hasMoreWork = scheduledHostCallback();
  } finally {
    if (hasMoreWork) {
      // hasMoreWork 存在值时，代表还有任务没有调度完，需要继续调度
      schedulePerformWorkUntilDeadline();
    } else {
      // 当前任务队列执行完毕后，恢复初始值
      scheduledHostCallback = null;
      isMessageLoopRunning = false;
    }
  }
};

channel.port1.onmessage = performWorkUntilDeadline;

// 用于请求执行任务回调
function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  // 如果消息循环尚未运行，则开始调度任务并设置当前为运行状态
  if (!isMessageLoopRunning) {
    // 当有新的渲染进来不需要反复调用
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

// 用于执行任务队列中的任务
// 当有任务需要中断以便给浏览器进行渲染，则跳出循环，从而来实现任务队列可中断
function workLoop() {
  let currentTask = taskQueue[0];
  while(currentTask) {
    // 判断是否需要中断来给浏览器渲染
    if (shouldYieldToHost()) {
      break;
    }
    const callback = currentTask.callback;
    callback();
    taskQueue.shift();
    currentTask = taskQueue[0];
  }
  // 给到外界反馈
  if (currentTask !== null) {
    return true; // 代表还有任务没有调度
  } else {
    return false; // 代表已经调度完毕
  }
}
// 刷新任务，执行任务直到队列为空
function flushWork() {
  return workLoop();
}

// 用于调度一个新的任务，将任务添加到任务队列中，并请求执行任务队列
function unstable_scheduleCallback(callback) {
  const newTask = {
    callback
  };

  taskQueue.push(newTask); // 想任务队列增加执行任务
  requestHostCallback(flushWork);
}

// 判断要不要中断任务去渲染 UI
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  // 判断是否大于时间间隔
  if (timeElapsed < frameInterval) {
    return false;
  }
  return true;
}

function runTask(tasks) {
  // 消耗任务列表
  unstable_scheduleCallback(() => {
    while(tasks.length > 0 && !shouldYieldToHost()) {
      const task = tasks.shift();
      task();
    }

    if (tasks.length > 0) {
      runTask(tasks);
    }
  });
}

// 模拟需要被回调的任务函数
function task() {
  console.log("执行任务 task")
  const start = performance.now();

  while (performance.now() - start < 1) {
    // 模拟执行任务
  }
}

document.querySelector(".start")
  .addEventListener("click", () => {
    const tasks = new Array(1e4).fill(task);
    runTask(tasks);
  });