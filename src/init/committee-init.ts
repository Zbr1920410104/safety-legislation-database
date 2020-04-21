import { read, WorkBook, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { v1 as uuidv1 } from 'uuid';
import ora from 'ora';

import Bill from '../models/bill';
import Committee from '../models/committee';
import moment from 'moment';

interface IExcelRow {
  number: string;
  committeeName?: string;
  committeeDate?: string;
  committeeReportsNumber?: string;
}

interface Icommittee {
  uuid: string;
  billUuid?: string;
  committeeName?: string;
  committeeDate?: Date;
  committeeReportsNumber?: string;
}

export default async () => {
  const spinner = ora('Committee').start();
  try {
    const billArr = await Bill.findAll({
      attributes: ['uuid', 'number'],
    });
    const buf: Buffer = fs.readFileSync(
      path.resolve(__dirname, '../excel/committee.xlsx')
    );
    const wb: WorkBook = read(buf);
    const dataArray: IExcelRow[] = utils.sheet_to_json(wb.Sheets.Sheet1);

    // 中文表头筛除
    dataArray.shift();

    let committeeArr: Icommittee[] = [];

    let _lastNumber: string = '';
    let lastNumberUuid: string | undefined = '';
    for (let item of dataArray) {
      if (item.number) {
        _lastNumber = item.number?.replace(/\(.*\)/g, '')?.trim();
        lastNumberUuid = await billArr.find(item => item.number === _lastNumber)
          ?.uuid;
      }

      if (
        item.committeeName ||
        item.committeeDate ||
        item.committeeReportsNumber
      ) {
        committeeArr.push({
          uuid: uuidv1(),
          billUuid: lastNumberUuid,
          committeeName: item.committeeName,
          committeeDate: item.committeeDate
            ? moment(item.committeeDate, 'MM/DD/YYYY', false).toDate()
            : undefined,
          committeeReportsNumber: item.committeeReportsNumber,
        });
      }
    }

    await Committee.bulkCreate(committeeArr);

    spinner.succeed();
  } catch (error) {
    console.error(error);
    spinner.fail();
  }
};