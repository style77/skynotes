generate-proto:
	protoc -I=./proto/ --go_out=./ --go-grpc_out=./ ./proto/thumbnailer.proto

generate-client:
	python -m grpc_tools.protoc -I=./proto/ --proto_path=proto --python_out=../../skynotes/thumbnailer --grpc_python_out=../../skynotes/thumbnailer ./proto/thumbnailer.proto