package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"log"
	"math"
	"net"
	"os"
	"os/signal"
	"syscall"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/peer"

	api "thumbnailer/grpc"
)

func MiddlewareHandler(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
	if p, ok := peer.FromContext(ctx); ok {
		if mtls, ok := p.AuthInfo.(credentials.TLSInfo); ok {
			for _, item := range mtls.State.PeerCertificates {
				log.Println("client certificate subject:", item.Subject)
			}
		}
	}
	return handler(ctx, req)
}

func LoadTlSConfig(certFile, keyFile, caFile string) (credentials.TransportCredentials, error) {
	certificate, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load server certification: %w", err)
	}

	data, err := os.ReadFile(caFile)
	if err != nil {
		return nil, fmt.Errorf("faild to read CA certificate: %w", err)
	}

	capool := x509.NewCertPool()
	if !capool.AppendCertsFromPEM(data) {
		return nil, fmt.Errorf("unable to append the CA certificate to CA pool")
	}

	tlsConfig := &tls.Config{
		ClientAuth:   tls.RequireAndVerifyClientCert,
		Certificates: []tls.Certificate{certificate},
		ClientCAs:    capool,
	}
	return credentials.NewTLS(tlsConfig), nil
}

func main() {

	secureAddress := "0.0.0.0:50051"

	grpc.MaxCallRecvMsgSize(math.MaxInt64)
	grpc.MaxCallSendMsgSize(math.MaxInt64)

	server := grpc.NewServer(
		grpc.UnaryInterceptor(MiddlewareHandler),
	)

	api.RegisterThumbnailServiceServer(server, new(api.Server))

	basectx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	listener, err := net.Listen("tcp", secureAddress)
	if err != nil {
		panic(err)
	}

	go func() {
		<-basectx.Done()
		server.GracefulStop()
		log.Println("bye")
	}()

	log.Println("listen and serving...")
	if err := server.Serve(listener); err != nil {
		panic(err)
	}
}
