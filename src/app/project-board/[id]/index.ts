/**
 * These imports are written out explicitly because they
 * need to be statically analyzable to be uploaded to CodeSandbox correctly.
 */


export type Person = {
	userId: string;
	name: string;
	role: string;
	avatarUrl: string;
};

const avatarMap: Record<string, string> = {
  Alexander: "https://via.placeholder.com/150?text=Alexander",
  Aliza: "https://via.placeholder.com/150?text=Aliza",
  Alvin: "https://via.placeholder.com/150?text=Alvin",
  Angie: "https://via.placeholder.com/150?text=Angie",
  Arjun: "https://via.placeholder.com/150?text=Arjun",
  Blair: "https://via.placeholder.com/150?text=Blair",
  Claudia: "https://via.placeholder.com/150?text=Claudia",
  Colin: "https://via.placeholder.com/150?text=Colin",
  Ed: "https://via.placeholder.com/150?text=Ed",
  Effie: "https://via.placeholder.com/150?text=Effie",
  Eliot: "https://via.placeholder.com/150?text=Eliot",
  Fabian: "https://via.placeholder.com/150?text=Fabian",
  Gael: "https://via.placeholder.com/150?text=Gael",
  Gerard: "https://via.placeholder.com/150?text=Gerard",
  Hasan: "https://via.placeholder.com/150?text=Hasan",
  Helena: "https://via.placeholder.com/150?text=Helena",
  Ivan: "https://via.placeholder.com/150?text=Ivan",
  Katina: "https://via.placeholder.com/150?text=Katina",
  Lara: "https://via.placeholder.com/150?text=Lara",
  Leo: "https://via.placeholder.com/150?text=Leo",
  Lydia: "https://via.placeholder.com/150?text=Lydia",
  Maribel: "https://via.placeholder.com/150?text=Maribel",
  Milo: "https://via.placeholder.com/150?text=Milo",
  Myra: "https://via.placeholder.com/150?text=Myra",
  Narul: "https://via.placeholder.com/150?text=Narul",
  Norah: "https://via.placeholder.com/150?text=Norah",
  Oliver: "https://via.placeholder.com/150?text=Oliver",
  Rahul: "https://via.placeholder.com/150?text=Rahul",
  Renato: "https://via.placeholder.com/150?text=Renato",
  Steve: "https://via.placeholder.com/150?text=Steve",
  Tanya: "https://via.placeholder.com/150?text=Tanya",
  Tori: "https://via.placeholder.com/150?text=Tori",
  Vania: "https://via.placeholder.com/150?text=Vania",
};;

const names: string[] = Object.keys(avatarMap);

const roles: string[] = [
	'Engineer',
	'Senior Engineer',
	'Principal Engineer',
	'Engineering Manager',
	'Designer',
	'Senior Designer',
	'Lead Designer',
	'Design Manager',
	'Content Designer',
	'Product Manager',
	'Program Manager',
];

let sharedLookupIndex: number = 0;

/**
 * Note: this does not use randomness so that it is stable for VR tests
 */
export function getPerson(): Person {
	sharedLookupIndex++;
	return getPersonFromPosition({ position: sharedLookupIndex });
}

export function getPersonFromPosition({ position }: { position: number }): Person {
	// use the next name
	const name = names[position % names.length];
	// use the next role
	const role = roles[position % roles.length];
	return {
		userId: `id:${position}`,
		name,
		role,
		avatarUrl: avatarMap[name],
	};
}

export function getPeopleFromPosition({
	amount,
	startIndex,
}: {
	amount: number;
	startIndex: number;
}): Person[] {
	return Array.from({ length: amount }, () => getPersonFromPosition({ position: startIndex++ }));
}

export function getPeople({ amount }: { amount: number }): Person[] {
	return Array.from({ length: amount }, () => getPerson());
}

export type ColumnType = {
	title: string;
	columnId: string;
	items: Person[];
};
export type ColumnMap = { [columnId: string]: ColumnType };

export function getData({
	columnCount,
	itemsPerColumn,
}: {
	columnCount: number;
	itemsPerColumn: number;
}) {
	const columnMap: ColumnMap = {};

	for (let i = 0; i < columnCount; i++) {
		const column: ColumnType = {
			title: `Column ${i}`,
			columnId: `column-${i}`,
			items: getPeople({ amount: itemsPerColumn }),
		};
		columnMap[column.columnId] = column;
	}
	const orderedColumnIds = Object.keys(columnMap);

	return {
		columnMap,
		orderedColumnIds,
		lastOperation: null,
	};
}

export function getBasicData() {
	const columnMap: ColumnMap = {
		confluence: {
			title: 'Confluence',
			columnId: 'confluence',
			items: getPeople({ amount: 10 }),
		},
		jira: {
			title: 'Jira',
			columnId: 'jira',
			items: getPeople({ amount: 10 }),
		},
		trello: {
			title: 'Trello',
			columnId: 'trello',
			items: getPeople({ amount: 10 }),
		},
	};

	const orderedColumnIds = ['confluence', 'jira', 'trello'];

	return {
		columnMap,
		orderedColumnIds,
	};
}
