package grpc

import (
	"bytes"
	"context"
	"image/png"
	"io"

	thumbnailer "github.com/bakape/thumbnailer/v2"
)

type Server struct {
	UnimplementedThumbnailServiceServer
}

func (s *Server) GenerateThumbnail(ctx context.Context, req *ThumbnailRequest) (*ThumbnailResponse, error) {

	opts := thumbnailer.Options{
		ThumbDims: thumbnailer.Dims{
			Width:  200,
			Height: 400,
		},
	}

	reader := bytes.NewReader(req.Content)
	var readSeeker io.ReadSeeker = reader

	_, thumbnail, err := thumbnailer.Process(readSeeker, opts)

	if err != nil {
		return nil, err
	}

	buff := new(bytes.Buffer)

	err = png.Encode(buff, thumbnail)
	if err != nil {
		return nil, err
	}

	return &ThumbnailResponse{
		Thumbnail: buff.Bytes(),
	}, nil
}
