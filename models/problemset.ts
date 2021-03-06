import * as TypeORM from "typeorm";
import Model from "./common";

import Problem from "./problem";

@TypeORM.Entity()
export default class Problemset extends Model{
    static cache = true;

    @TypeORM.PrimaryGeneratedColumn()
    id: number;

    @TypeORM.Column({ nullable: true, type: "varchar", length: 80})
    title: string

    @TypeORM.Column({ nullable: true, type: "text" })
    subtitle: string;

    @TypeORM.Column({ nullable: true, type: "text" })
    information: string;

    @TypeORM.Column({ nullable: true, type: "text" })
    problems: string;

    @TypeORM.Column({ nullable: true, type: "boolean" })
    is_public: boolean;

    async delete() {
      await this.destroy();  
    }

    async changeID(id){
      const oldID = this.id;
      this.id = id;
      
      await this.save();
      
      await Problemset.deleteFromCache(oldID);
    }

    async isSupervisitor(user){
      return user && (user.is_admin || await user.hasPrivilege('manage_problemset'));
    }

    async getProblems(){
        if(!this.problems)  return [];
        return this.problems.split('|').map(x => parseInt(x))
    }
    
    async setProblemsNoCheck(problemIDs) {
        this.problems = problemIDs.join('|');
      }
    
    async setProblems(s) {
        let a = [];
        await s.split('|').forEachAsync(async x => {
          let problem = await Problem.findById(x);
          if (!problem) return;
          a.push(x);
        });
        this.problems = a.join('|');
      }
}