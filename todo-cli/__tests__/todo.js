/* eslint-disable no-undef */
//const { default: test } = require("node:test");
//const { test } = require("test");
const todoList = require("../todo");

const {
  all,
  add,
  markAsComplete,
  overdue,
  dueToday,
  dueLater,
  toDisplayableList,
} = todoList();

describe("Todolist Test Suite", () => {
  test("Should add new todo", () => {
    expect(all.length).toBe(0);
    let dt = new Date();
    dt = dt.toISOString().split("T")[0];
    add({
      title: "Test todo",
      completed: false,
      dueDate: dt,
    });
    const formattedDate = (d) => {
      return d.toISOString().split("T")[0];
    };
    var dateToday = new Date();

    const today = formattedDate(dateToday);
    const yesterday = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() - 1)),
    );
    const tomorrow = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() + 1)),
    );
    add({ title: "Submit assignment", dueDate: yesterday, completed: false });
    add({ title: "Pay rent", dueDate: today, completed: true });
    add({ title: "Service Vehicle", dueDate: today, completed: false });
    add({ title: "File taxes", dueDate: tomorrow, completed: false });
    add({ title: "Pay electric bill", dueDate: tomorrow, completed: false });
    expect(all.length > 0).toBe(true);
  });

  test("markAsComplete is working or not", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("checks retrieval of overdue items", () => {
    var overdues = overdue();
    var formattedOverdues = toDisplayableList(overdues);
    expect(formattedOverdues.length > 0).toBe(true);
  });

  test("checks retrieval of due today items", () => {
    var overdues = dueToday();
    var formattedItemsDueToday = toDisplayableList(overdues);
    expect(formattedItemsDueToday.length > 0).toBe(true);
  });

  test("checks retrieval of due later items", () => {
    var overdues = dueLater();
    var formattedItemsDueLater = toDisplayableList(overdues);
    expect(formattedItemsDueLater.length > 0).toBe(true);
  });
});
