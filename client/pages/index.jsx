import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../config/firebase.config";
import { getAllSongs, validateUser } from "../api";
import { Home, Loader, MusicPlayer } from "../components";
import { useStateValue } from "../Context/StateProvider";
import { actionType } from "../Context/reducer";
import { motion } from "framer-motion";

export default function HomePage() {
  const firebaseAuth = getAuth(app);
  const router = useRouter();

  const [{ user, allSongs, song, isSongPlaying, miniPlayer }, dispatch] =
    useStateValue();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  const [auth, setAuth] = useState(
    false ||
      (typeof window !== "undefined" &&
        window?.localStorage?.getItem("auth") === "true")
  );

  useEffect(() => {
    setIsLoading(true);
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        userCred.getIdToken().then((token) => {
          window?.localStorage?.setItem("auth", "true");
          validateUser(token).then((data) => {
            dispatch({
              type: actionType.SET_USER,
              user: data,
            });
          });
        });
        setIsLoading(false);
      } else {
        setAuth(false);
        dispatch({
          type: actionType.SET_USER,
          user: null,
        });
        setIsLoading(false);
        window?.localStorage.setItem("auth", "false");
        router.replace("/login");
      }
    });
  }, []);

  useEffect(() => {
    if (!allSongs && user) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.data,
        });
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-auto flex items-center justify-center min-w-[680px]">
        {isLoading ||
          (!user && (
            <div className="fixed inset-0 bg-loaderOverlay backdrop-blur-sm ">
              <Loader />
            </div>
          ))}
        <Home />

        {isSongPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed min-w-[700px] h-26  inset-x-0 bottom-0  bg-cardOverlay drop-shadow-2xl backdrop-blur-md flex items-center justify-center`}
          >
            <MusicPlayer />
          </motion.div>
        )}
      </main>
    </>
  );
}
