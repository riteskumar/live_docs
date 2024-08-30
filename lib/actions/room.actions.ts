"use server";
import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";

import { redirect } from "next/navigation";
export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();
  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };
    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });
    revalidatePath("/");
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room : ${error}`);
  }
};
export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting a room:${error}`);
  }
};
export const getDocuments = async (email:string) => {
  try {
    const rooms = await liveblocks.getRooms({userId:email});
    
    return parseStringify(rooms);
  } catch (error) {
    console.log(`Error happened while getting a rooms:${error}`);
  }
};


export const updateDocument =  async(roomId:string , title:string)=>{
  try {
      const updateRoom = await liveblocks.updateRoom(roomId , {
        metadata:{
          title
        }
      })
      revalidatePath(`/documents/${roomId}`)
      return parseStringify(updateRoom)
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
}

export const updateDocumentAccess = async({roomId,email,userType,updatedBy}:ShareDocumentParams)=>{
  try {
    const userAccess:RoomAccesses={
      [email] :getAccessType(userType) as AccessType,
    }
    const room = await liveblocks.updateRoom(roomId,{
      usersAccesses:userAccess
    } )
    if(room){
      const notifcationId = nanoid();
      await liveblocks.triggerInboxNotification({
        userId:email,
        kind: '$documentAccess',
        subjectId:notifcationId,
        activityData:{
          userType,title:`You have been granted ${userType} access to the document by ${updatedBy.name}`,
          avatar:updatedBy.avatar,
          email:updatedBy.email

        },
        roomId
      })
      
    }
    revalidatePath(`/documents/${roomId}`)
    return parseStringify(room)
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }


}

export const removeCollaborator = async({roomId ,email}:{roomId:string , email:string})=>{
  try {
    const room = await liveblocks.getRoom(roomId)
    if(room.metadata.email === email){
      throw new Error('You cannot remove yourself from the document')
    }

    const updateRoom = await liveblocks.updateRoom(roomId , {
      usersAccesses:{
        [email]:null
      }
    })
    revalidatePath(`/documents/${roomId}`)
    return parseStringify(updateRoom)
    
  } catch (error) {
    console.log(`Error happened while removing a collaborator:${error}`);
  }
}

export const deleteDocument = async(roomId:string)=>{
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/')
  } 
  catch(error){
    console.log(`Error happened while deleting a document:${error}`)
  }     
}

