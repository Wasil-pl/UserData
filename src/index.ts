const inquirer = require('inquirer');
const consola = require('consola');

enum Action {
  List = "list",
  Add = "add",
  Remove = "remove",
  Quit = "quit",
  Edit = "edit"
}

enum MessageVariant {
  Info = "info",
  Success = "success",
  Error = "error"
}

interface User {
  name: string;
  age: number;
}
  
type InquirerAnswers = {
  action: Action
}


class Message {
  constructor(private content: string) {}

  public show(): void {
    console.log(this.content);
  }

  public capitalize(): void {
    this.content = this.content.charAt(0).toUpperCase() + this.content.slice(1).toLowerCase();
  }

  public toUpperCase(): void {
    this.content = this.content.toUpperCase();
  }

  public toLowerCase(): void {
    this.content = this.content.toLowerCase();
  }

  static showColorized(variant: MessageVariant, text: string ): void {
    switch (variant) {
      case MessageVariant.Info:
        consola.info(text);
        break;
      case MessageVariant.Success:
        consola.success(text);
        break;
      case MessageVariant.Error:
        consola.error(text);
        break;
      default:
        console.log(text);
    }
  }
}

class UsersData {
  data: User[] = [];

  public add(user: User): void {
    if (typeof user.name !== 'string' || user.name.length === 0) return Message.showColorized(MessageVariant.Error, 'Wrong name');
    if (typeof user.age !== 'number' || user.age <= 0) return Message.showColorized(MessageVariant.Error, 'Wrong age');

    this.data.push(user);
    Message.showColorized(MessageVariant.Success, 'User has been successfully added!');
  }
  
  public showAll(): void {
    if (this.data.length === 0) return  Message.showColorized(MessageVariant.Info, 'No Data... ');
    Message.showColorized(MessageVariant.Info, 'Users data: ');
    console.table(this.data);   
  } 

  public remove(name: string): void {
    const user = this.data.find(user => user.name === name);
    if (!user) return Message.showColorized(MessageVariant.Error, 'User not found');
  
    this.data = this.data.filter(user => user.name !== name);
    Message.showColorized(MessageVariant.Success, 'User deleted!');
  }

  public edit(name: string,  user: User): void {
    const userToEdit = this.data.find(user => user.name === name);
  
    userToEdit.name = user.name;
    userToEdit.age = user.age;

    Message.showColorized(MessageVariant.Success, 'User edited!');
  }
}

const users = new UsersData();
console.log("\n");
console.info("???? Welcome to the UsersApp!");
console.log("====================================");
Message.showColorized(MessageVariant.Info, "Available actions");
console.log("\n");
console.log("list – show all users");
console.log("add – add new user to the list");
console.log("edit – edit user on the list");
console.log("remove – remove user from the list");
console.log("quit – quit the app");
console.log("\n");

const startApp = () => {
  inquirer.prompt([{
    name: 'action',
    type: 'input',
    message: 'How can I help you?',
  }]).then(async (answers: InquirerAnswers) => {
    if (!Object.values(Action).includes(answers.action))  Message.showColorized(MessageVariant.Error, 'Command not found');

    switch (answers.action) {
      case Action.List:
        users.showAll();
        break;

      case Action.Add:
        const user = await inquirer.prompt([{
          name: 'name',
          type: 'input',
          message: 'Enter name',
        }, {
          name: 'age',
          type: 'number',
          message: 'Enter age',
        }]);
        users.add(user);
        break;

      case Action.Edit:
        const userToEdit = await inquirer.prompt([{
          name: 'name',
          type: 'input',
          message: 'Enter name to edit',
        }]);

        const findUser = users.data.find(user => user.name === userToEdit.name);
        if (!findUser) {
          Message.showColorized(MessageVariant.Error, 'User not found');
          break;
        }

        const userEdited = await inquirer.prompt([{
          name: 'name',
          type: 'input',
          message: 'Enter new name',
        }, {
          name: 'age',
          type: 'number',
          message: 'Enter new age',
        }]);
        users.edit(userToEdit.name, userEdited);
        break;

      case Action.Remove:
        const name = await inquirer.prompt([{
          name: 'name',
          type: 'input',
          message: 'Enter name',
        }]);
        users.remove(name.name);
        break;
        
      case Action.Quit:
        Message.showColorized(MessageVariant.Info, "Bye bye!");
        return;
    }

    startApp();
  });
}

startApp()