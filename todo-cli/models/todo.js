// models/todo.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const overdueTasks = await Todo.overdue();
      let arr1 = overdueTasks
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(arr1);
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const dueTodayList = await Todo.dueToday();
      arr1 = dueTodayList.map((todo) => todo.displayableString()).join("\n");
      console.log(arr1);
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      const dueLaterList = await Todo.dueLater();
      arr1 = dueLaterList.map((todo) => todo.displayableString()).join("\n");
      console.log(arr1);
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const { Op } = require("sequelize");
      let dt = new Date().toISOString().split("T")[0];
      let arr = await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: dt,
          },
        },
      });
      return arr;
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const { Op } = require("sequelize");
      let dt = new Date().toISOString().split("T")[0];
      let arr = await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: dt,
          },
        },
      });

      return arr;
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const { Op } = require("sequelize");
      let dt = new Date().toISOString().split("T")[0];
      let arr = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: dt,
          },
        },
      });

      return arr;
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      await Todo.update(
        { completed: true },
        {
          where: {
            id: id,
          },
        },
      );
    }

    displayableString() {
      const dt = new Date().toISOString().split("T")[0];
      if (this.dueDate == dt) {
        let checkbox = this.completed ? "[x]" : "[ ]";
        return `${this.id}. ${checkbox} ${this.title}`;
      } else {
        let checkbox = this.completed ? "[x]" : "[ ]";
        return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
      }
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};