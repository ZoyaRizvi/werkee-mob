import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CircularProgress } from "@mui/material"; // Added loading spinner

export function Recruiters() {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({ displayName: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [loadingAddUser, setLoadingAddUser] = useState(false); // Loading state for adding user
  const [errorMessage, setErrorMessage] = useState(""); // Error message for add user

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Query the users collection for recruiters
        const q = query(collection(db, "users"), where("role", "==", "recruiter"));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsersData(users);
      } catch (error) {
        console.error("Error fetching recruiters: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenConfirmDialog = (userId) => {
    setUserToDelete(userId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, "users", userToDelete));
        setUsersData(usersData.filter((user) => user.id !== userToDelete));
        handleCloseConfirmDialog();
      } catch (error) {
        console.error("Error deleting user: ", error);
      }
    }
  };

  const handleOpenAddUserDialog = () => {
    setOpenAddUserDialog(true);
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setNewUser({ displayName: "", email: "", role: "" });
    setErrorMessage("");
  };

  const handleAddUser = async () => {
    // Basic form validation
    const { displayName, email, role } = newUser;
    if (!displayName || !email || !role) {
      setErrorMessage("All fields are required.");
      return;
    }
    // Email format validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }
    
    setLoadingAddUser(true); // Start loading
    try {
      await addDoc(collection(db, "users"), {
        ...newUser,
        img: "",
        createdAt: serverTimestamp(),
      });
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(user => user.id !== currentUserId); // Exclude logged-in user
      setUsersData(users);
      handleCloseAddUserDialog();
    } catch (error) {
      console.error("Error adding user: ", error);
      setErrorMessage("Error adding user. Please try again.");
    } finally {
      setLoadingAddUser(false); // Stop loading
    }
  };

  return (
    <div className="mt-12">
      {/* Users Table */}
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Recruiters
              </Typography>
              <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>{usersData.length}</strong> registered
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray" onClick={handleOpenAddUserDialog}>
                  <EllipsisVerticalIcon strokeWidth={3} fill="currentColor" className="h-6 w-6" />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem onClick={handleOpenAddUserDialog}>Create User</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <CircularProgress />
              </div>
            ) : (
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Avatar", "Name", "Email", "Role", ""].map((header, index) => (
                      <th key={index} className="border-b border-blue-gray-100 py-3 px-5 text-left">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                          {header}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersData.map(({ img, id, displayName, email, role }, index) => {
                    const isLast = index === usersData.length - 1;
                    const classes = isLast ? "py-3 px-5" : "py-3 px-5 border-b border-blue-gray-50";

                    return (
                      <tr key={id}>
                        <td className={classes}>
                          <Avatar src={img} alt={displayName} />
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-bold">
                            {displayName}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {email}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {role}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <IconButton size="sm" variant="text" color="blue-gray" onClick={() => handleOpenConfirmDialog(id)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={openAddUserDialog} onClose={handleCloseAddUserDialog}>
        <DialogHeader>Create User</DialogHeader>
        <DialogBody>
          <Input
            label="Display Name"
            value={newUser.displayName}
            onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
          />
          <Input
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Input
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          />
          {errorMessage && (
            <Typography color="red" className="mt-2 text-sm">
              {errorMessage}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseAddUserDialog}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleAddUser}
            disabled={loadingAddUser}
          >
            {loadingAddUser ? "Adding..." : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          <Typography variant="h6">Are you sure you want to delete this recruiter?</Typography>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseConfirmDialog}>
            Cancel
          </Button>
          <Button variant="gradient" color="green" onClick={handleConfirmDelete}>
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
