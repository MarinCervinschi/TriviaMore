"use client"

import React from "react";
import { useUser } from "@/providers/UserProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
    BookOpen,
    User as UserIcon,
    Settings,
    Trophy,
    ArrowRight,
    Calendar,
    Mail,
    Shield
} from "lucide-react";

function getRoleLabel(role: string): string {
    switch (role) {
        case 'SUPERADMIN':
            return "Super Amministratore";
        case 'ADMIN':
            return "Amministratore";
        case 'MAINTAINER':
            return "Manutentore";
        case 'STUDENT':
            return "Studente";
        default:
            return role;
    }
}

function getRoleBadgeVariant(role: string) {
    switch (role) {
        case 'SUPERADMIN':
            return "destructive";
        case 'ADMIN':
            return "default";
        case 'MAINTAINER':
            return "secondary";
        case 'STUDENT':
            return "outline";
        default:
            return "outline";
    }
}

export default function DashboardPageComponent() {
    const { user } = useUser();
    if (!user) {
        throw new Error('User should be defined in protected route');
    }

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : user.email?.charAt(0).toUpperCase() || 'U';

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-white/20">
                            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                            <AvatarFallback className="text-lg bg-white/20">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Benvenuto, {user.name || user.email}!
                            </h1>
                            <p className="text-blue-100">
                                Ecco la tua dashboard personale su TriviaMore
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                            {getRoleLabel(user.role)}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* User Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Informazioni del Profilo
                    </CardTitle>
                    <CardDescription>
                        I tuoi dati di sessione attuali
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Nome</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.name || 'Non specificato'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Ruolo</p>
                                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                                        {getRoleLabel(user.role)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Informazioni Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Dati dalla sessione corrente
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-sm font-medium">ID Utente</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {user.id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-sm font-medium">Verifiche</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                            {user.email ? 'Email Presente' : 'Email Mancante'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {user.image ? 'Foto Profilo' : 'Nessuna Foto'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Esplora Corsi
                        </CardTitle>
                        <CardDescription>
                            Scopri i corsi disponibili e inizia a studiare
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/browse">
                                Vai ai Corsi <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            I Miei Quiz
                        </CardTitle>
                        <CardDescription>
                            Visualizza i quiz completati e le statistiche
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            <Link href="/my-quizzes" className="flex items-center">
                                Vedi Quiz <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Impostazioni
                        </CardTitle>
                        <CardDescription>
                            Gestisci il tuo profilo e le preferenze
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">
                            <Link href="/settings" className="flex items-center">
                                Impostazioni <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Next Steps */}
            <Card>
                <CardHeader>
                    <CardTitle>Prossimi Passi</CardTitle>
                    <CardDescription>
                        Suggerimenti per iniziare su TriviaMore
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <div>
                                <p className="font-medium">Esplora i corsi disponibili</p>
                                <p className="text-sm text-muted-foreground">
                                    Naviga tra i dipartimenti e trova i corsi di tuo interesse
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <div>
                                <p className="font-medium">Iscriviti alle classi</p>
                                <p className="text-sm text-muted-foreground">
                                    Aggiungi le classi ai tuoi preferiti per accedere ai quiz
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <div>
                                <p className="font-medium">Inizia con i quiz</p>
                                <p className="text-sm text-muted-foreground">
                                    Metti alla prova le tue conoscenze e migliora i tuoi punteggi
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Debug - Dati Sessione</CardTitle>
                    <CardDescription>
                        Visualizzazione dei dati completi della sessione (solo per sviluppo)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}