import * as fs from 'fs';
import parse from 'csv-parse';
import { Transform } from 'stream';

type WouldBe<T> = { [P in keyof T]?: unknown };

const isRecord = <T extends Record<string, unknown>>(
  value: unknown
): value is WouldBe<T> => {
  return typeof value === 'object' && value !== null;
};

type CommaSeparatedMembers = string;
type Member = string;

type DirtyCsvRecord = {
  '﻿Emojis': string;
  Options: string;
  Votes: string;
  Rates: string;
  Members: CommaSeparatedMembers;
};

type Candidate = {
  id: number;
  emoji: string;
  option: string;
};

type Choice = {
  candidateId: number;
  member: Member;
};

const isCsvRecord = (arg: unknown): arg is DirtyCsvRecord => {
  return (
    isRecord<DirtyCsvRecord>(arg) &&
    typeof arg['﻿Emojis'] === 'string' &&
    typeof arg.Options === 'string' &&
    typeof arg.Votes === 'string' &&
    typeof arg.Rates === 'string' &&
    typeof arg.Members === 'string'
  );
};

const parserWrapper = async (fileName: string) => {
  const csv = fs.createReadStream(fileName, 'utf8');
  const parser = parse({ columns: true });
  const arr = [];
  for await (const chunk of csv.pipe(parser)) {
    if (!isCsvRecord(chunk)) {
      throw new Error('invaled types');
    }

    arr.push(chunk);
  }
  return arr;
};

const main = async () => {
  const arr = await parserWrapper('./data/806534165565538385.csv');

  const candidates = new Map<number, Candidate>();
  const members = new Set<Member>();
  const choices: Array<Choice> = [];
  for (const [candidateId, record] of arr.entries()) {
    candidates.set(candidateId, {
      id: candidateId,
      emoji: record['﻿Emojis'],
      option: record.Options,
    });

    for (const member of record.Members.split(',')) {
      members.add(member);
      choices.push({
        candidateId,
        member,
      });
    }
  }

  // テーブル処理
  console.log(choices);
};

main();
