import { loginAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <form action={loginAction}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <QrCode className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Masuk ke dasbor kasir QR Tunai Drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="admin" required defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Masuk
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
