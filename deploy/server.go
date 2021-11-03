package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

func Log(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/static/") {
			log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL)
		}
		handler.ServeHTTP(w, r)
	})
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	if _, err := os.Stat("dist/" + r.URL.Path); os.IsNotExist(err) {
		http.ServeFile(w, r, "dist/index.html")
	} else {
		http.ServeFile(w, r, "dist/"+r.URL.Path)
	}
}

func main() {
	file_url := "/usr/src/app/dist/"

	// open and recreate file with env variables
	data, err := ioutil.ReadFile(file_url + "env.txt")
	if err != nil {
		log.Fatal(err)
	}

	new_content := strings.ReplaceAll(string(data), "ENVIRONMENT_VERSION", "'"+os.Getenv("ENVIRONMENT_VERSION")+"'")
	err = ioutil.WriteFile(file_url+"assets/env.js", []byte(new_content), 0644)
	if err != nil {
		log.Fatalln(err)
	}

	// start web app
	http.HandleFunc("/", rootHandler)

	log.Println("Aplicação iniciada com sucesso")
	http.ListenAndServe(":8080", Log(http.DefaultServeMux))
}
