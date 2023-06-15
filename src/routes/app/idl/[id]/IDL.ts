import type { Keypair } from "@solana/web3.js";

export interface IDL {
	name: string;
	errors?: Error[];
	constants?: Constant[];
	accounts?: Account[];
	events?: Event[];
	types?: Type[];
	instructions?: Instruction[];
}

export type Instruction = {
	name: string;
	discriminator: number[];
	docs?: string[];
	accounts: IdlAccountItem[];
	args: IdlField[];
	returns?: IdlType;
	accountValues?: CustomAccountType[];
	argumentvalues?: string[];
};

export type CustomAccountType = {
	value: string;
	keypair: Keypair | null;
	generateKeypair: boolean;
	accountType: number; // 0 --> public key, 1 --> generate keypair, 2 --> sysprogram
}

export type IdlAccountItem = IdlAccount | IdlAccounts;

export type IdlAccount = {
	name: string;
	isMut: boolean;
	isSigner: boolean;
	docs?: string[];
	relations?: string[];
	pda?: IdlPda;
};

export type IdlAccounts = {
	name: string;
	docs?: string[];
	accounts: IdlAccountItem[];
};

export function IsMut(account: IdlAccountItem): boolean {
	if ('isMut' in account) return account.isMut;
	return false;
}

export function IsSigner(account: IdlAccountItem): boolean {
	if ('isSigner' in account) return account.isSigner;
	return false;
}

export type IdlPda = {
	seeds: IdlSeed[];
	programId?: IdlSeed;
};

export type IdlSeed = any;

export type Type = {
	name: string;
	docs?: string[];
	type: IdlTypeDefTy;
};

export type IdlTypeDefTy = IdlTypeDefTyEnum | IdlTypeDefTyStruct;

export type IdlTypeDefTyEnum = {
	kind: 'enum';
	variants: IdlEnumVariant[];
};

export type IdlEnumVariant = {
	name: string;
	fields?: IdlEnumFields;
};
export type IdlEnumFields = IdlEnumFieldsNamed | IdlEnumFieldsTuple;

export type IdlEnumFieldsNamed = IdlField[];

export type IdlEnumFieldsTuple = IdlType[];

export type Event = {
	name: string;
	discriminator: number[];
	fields: IdlEventField[];
};

export type IdlEventField = {
	name: string;
	type: IdlType;
	index: boolean;
};

export type Account = {
	name: string;
	discriminator: number[];
	docs?: string[];
	type: IdlTypeDefTyStruct;
};

export type IdlTypeDefTyStruct = {
	kind: 'struct';
	fields: IdlTypeDefStruct;
};

export type IdlTypeDefStruct = Array<IdlField>;

export type IdlField = {
	name: string;
	docs?: string[];
	type: IdlType;
};

export type Constant = {
	name: string;
	type: IdlType;
	value: string;
};
export type Error = {
	code: number;
	name: string;
	msg?: string;
};

export type IdlType =
	| 'bool'
	| 'u8'
	| 'i8'
	| 'u16'
	| 'i16'
	| 'u32'
	| 'i32'
	| 'f32'
	| 'u64'
	| 'i64'
	| 'f64'
	| 'u128'
	| 'i128'
	| 'bytes'
	| 'string'
	| 'publicKey'
	| IdlTypeDefined
	| IdlTypeOption
	| IdlTypeCOption
	| IdlTypeVec
	| IdlTypeArray;

export function IdlTypeToString(type: IdlType): string {
	if (typeof type === 'string') return type;
	if ('defined' in type) return type.defined;
	if ('option' in type) return 'Option<' + IdlTypeToString(type.option) + '>';
	if ('coption' in type) return IdlTypeToString(type.coption);
	if ('vec' in type) return IdlTypeToString(type.vec);
	return IdlTypeToString(type.array[0]);
}

export type IdlTypeDefined = {
	defined: string;
};

export type IdlTypeOption = {
	option: IdlType;
};

export type IdlTypeCOption = {
	coption: IdlType;
};

export type IdlTypeVec = {
	vec: IdlType;
};

export type IdlTypeArray = {
	array: [idlType: IdlType, size: number];
};
