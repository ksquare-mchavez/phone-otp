package main

import (
	"context"
	"fmt"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"google.golang.org/api/option"
)

var (
	app *firebase.App
	req struct {
		IDToken string `json:"idToken"`
	}
)

func main() {
	if err := initFirebase(); err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	appFiber := fiber.New()
	setupCors(appFiber)
	appFiber.Post("/verify-id-token", verifyIDToken)

	fmt.Println("Fiber server started at :8080")
	log.Fatal(appFiber.Listen(":8080"))
}

func initFirebase() error {
	sa := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if sa == "" {
		return fmt.Errorf("GOOGLE_APPLICATION_CREDENTIALS env var must be set to the path of your Firebase service account key JSON file")
	}

	var err error
	app, err = firebase.NewApp(context.Background(), nil, option.WithCredentialsFile(sa))
	return err
}

func setupCors(appFiber *fiber.App) {
	appFiber.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowMethods: "POST,OPTIONS",
		AllowHeaders: "Content-Type",
	}))
}

func verifyIDToken(c *fiber.Ctx) error {
	ctx := context.Background()
	client, err := app.Auth(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to get Auth client")
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid request")
	}

	token, err := client.VerifyIDToken(ctx, req.IDToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).SendString("Invalid ID token")
	}

	resp := map[string]interface{}{
		"uid":    token.UID,
		"claims": token.Claims,
		"token":  token,
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}
