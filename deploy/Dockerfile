FROM golang:latest

RUN mkdir /usr/src/app

COPY dist /usr/src/app/dist
COPY server.go /usr/src/app/

WORKDIR /usr/src/app
EXPOSE 8080

RUN go build -o main .
CMD ["./main"]