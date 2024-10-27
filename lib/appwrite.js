import { Client, Databases, Query } from "react-native-appwrite";
import { Account } from "react-native-appwrite";
import { ID } from "react-native-appwrite";
export const config = {
	endpoint: "https://cloud.appwrite.io/v1",
	platform: "com.smn.study-group-organizer",
	projectId: "671be64c0033b4afce4b",
	databaseId: "671bebe100211430698c",
	usersCollectionId: "671beee4003e6cb54112",
	rolesCollectionId: "671bf229001242774bb1",
	storageId: "671bf3840008f2587782",
};
// Init your React Native SDK
const client = new Client();

client
	.setEndpoint(config.endpoint) // Your Appwrite Endpoint
	.setProject(config.projectId) // Your project ID
	.setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const db = new Databases(client);

export async function createUser(
	email,
	password,
	username,
	firstName,
	lastName
) {
	try {
		const newAccount = await account.create(
			ID.unique(),
			email,
			password,
			username,
			firstName,
			lastName
		);
		if (!newAccount) throw Error;

		await signIn(email, password);
		const newUser = await db.createDocument(
			config.databaseId,
			config.usersCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email: email,
				username: username,
				firstName: firstName,
				lastName: lastName,
			}
		);
		return newUser;
	} catch (error) {
		console.log(console.log("app 57"));
		throw new Error(error);
	}
}

export async function signIn(email, password) {
	try {
		const session = await account.createEmailPasswordSession(email, password);
		return session;
	} catch (error) {
		console.log("app 67");
		throw new Error(error);
	}
}

export async function getAccount() {
	try {
		const currentAccount = await account.get();

		return currentAccount;
	} catch (error) {
		console.log("app 77");
		throw new Error(error);
	}
}

export const getCurrentUser = async () => {
	try {
		const currentAccount = await getAccount();

		if (!currentAccount) throw Error;

		const currentUser = await db.listDocuments(
			config.databaseId,
			config.usersCollectionId,
			[Query.equal("accountId", currentAccount.$id)]
		);
		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		console.log("appwrite 97");
		return null;
	}
};
